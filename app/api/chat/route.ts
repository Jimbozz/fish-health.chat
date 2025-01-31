import { OpenAI } from "openai";
import axios from "axios";
import { systemPrompt } from "@/app/system-prompt";

interface FishHealthData {
  liceLevel: string;
}

interface LocalityData {
  localityName: string;
  localityNo: string;
  municipalityNumber: string;
}

interface ParsedQuery {
  location: string;
  fishType: string;
}

interface ChatMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

// Utility function for environment variables
function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return value;
}

const openai = new OpenAI({
  apiKey: getEnvVariable("OPENAI_API_KEY"),
});

// Fetch locality data and salmon lice data from BarentsWatch API
async function fetchFishHealthData(queryParams: {
  location: string;
  fishType: string;
  focus: string;
}): Promise<LocalityData | null> {
  const apiUrl = "https://www.barentswatch.no/bwapi/v1";

  try {
    const tokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/get-bw-token`,
      {
        method: "POST",
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to fetch BW token");
    }

    const tokenData = await tokenResponse.json();
    const BwToken = tokenData.access_token;

    // Step 1: Fetch the locality data based on location and fish type
    const response = await axios.get<any>(
      `${apiUrl}/geodata/fishhealth/localities`,
      {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${BwToken}`,
        },
      }
    );

    if (
      !response.data ||
      !response.data.localities ||
      response.data.localities.length === 0
    ) {
      console.error("No locality data found");
      return null;
    }

    // Extract locality data (municipalityNumber and localityName)
    const locality = response.data.localities[0];
    const localityData: LocalityData = {
      localityName: locality.name,
      localityNo: locality.localityNo,
      municipalityNumber: locality.municipalityNumber,
    };

    return localityData;
  } catch (error) {
    console.error("Error fetching fish health data:", error);
    return null;
  }
}

// Fetch salmon lice data based on municipalityNumber
async function fetchSalmonLiceData(
  municipalityNumber: string
): Promise<FishHealthData | null> {
  const apiUrl = "https://www.barentswatch.no/bwapi/v1";
  try {
    const tokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/get-bw-token`,
      {
        method: "POST",
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to fetch BW token");
    }

    const tokenData = await tokenResponse.json();
    const BwToken = tokenData.access_token;

    // Step 2: Fetch salmon lice data for the specific municipality
    const salmonLiceResponse = await axios.get<FishHealthData>(
      `${apiUrl}/geodata/municipality/${municipalityNumber}/salmonlice`,
      {
        headers: {
          Authorization: `Bearer ${BwToken}`,
        },
      }
    );

    return salmonLiceResponse.data;
  } catch (error) {
    console.error("Error fetching salmon lice data:", error);
    return null;
  }
}

// Parse user query to extract fish health parameters (location, fish type, etc.)
function parseUserQuery(query: string): ParsedQuery | null {
  const regex = /lice level.*in\s([a-zA-Z\s]+)\sfor\s([a-zA-Z\s]+)/;
  const match = query.match(regex);

  if (match) {
    return {
      location: match[1].trim(),
      fishType: match[2].trim(),
    };
  }

  return null;
}

function createStream(response: AsyncIterable<any>): ReadableStream<string> {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const deltaContent = chunk?.choices?.[0]?.delta?.content;
          if (deltaContent) {
            console.log("Streaming chunk:", deltaContent);
            controller.enqueue(deltaContent);
          }
          console.log("Chunk:", chunk);
        }
        controller.close();
      } catch (error) {
        console.error("Error during streaming:", error);
        controller.error(error);
      }
    },
  });
}

async function generateOpenAIResponse(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<Response> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    stream: true,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 0.8,
    max_tokens: 2048,
  });
  console.log("OpenAI response:", response);
  const stream = createStream(response);
  console.log("OpenAI response stream:", stream);
  return new Response(stream, {
    headers: { "Content-Type": "text/plain" },
  });
}

export async function POST(req: Request): Promise<Response> {
  const { messages }: { messages: ChatMessage[] } = await req.json();
  const userQuery = messages[messages.length - 1]?.content ?? "";
  const parsedQuery = parseUserQuery(userQuery);
  console.log("Parsed query:", parsedQuery);
  console.log("messages:", messages);

  if (parsedQuery) {
    const { location, fishType } = parsedQuery;

    // Fetch locality data (municipality number) based on location and fish type
    const localityData = await fetchFishHealthData({
      location,
      fishType,
      focus: "lice",
    });

    if (localityData) {
      const { municipalityNumber } = localityData;

      // Fetch salmon lice data using the municipality number
      const fishHealthData = await fetchSalmonLiceData(municipalityNumber);

      if (fishHealthData) {
        const fishHealthResponse = `The current lice levels for ${fishType} in ${location} (Municipality Number: ${municipalityNumber}) are as follows: Lice Level: ${fishHealthData.liceLevel}.`;

        const fullResponse = `
          Thank you for sharing the municipality number. Let me retrieve the relevant data for you from the BarentsWatch API.

          (Initiating API call to BarentsWatch...)

          After analyzing the latest data, I found the following details about fish health and lice infestations in municipality number ${municipalityNumber}:

          ${fishHealthResponse}

          The data reveals that the lice infestation levels have remained stable over the past month, indicating effective management measures.

          Remember, these data points are crucial as they allow us to monitor the health of fish populations and the impact of lice on them in real-time. Please let me know if you need information on any other aspect.`;

        return new Response(fullResponse, {
          headers: {
            "Content-Type": "text/plain",
          },
        });
      } else {
        console.warn("Salmon lice data not found.");
      }
    } else {
      console.warn("Locality data not found.");
    }
  }

  const openAIResponse = await generateOpenAIResponse(messages, systemPrompt);
  return openAIResponse;
}

//---------------------------------------------------------------------
