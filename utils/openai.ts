import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env["OPENAI_API_KEY"],
// });

// export async function getAIResponse(userInput) {
//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a precise assistant. Only respond with data explicitly provided. If unsure, respond with 'I don't know.' Do not make assumptions or hallucinate.",
//         },
//         { role: "user", content: userInput },
//       ],
//     });
//     return response.choices[0].message;
//     // return response.choices[0].message.content;
//   } catch (error) {
//     console.error("OpenAI API Error:", error);
//     throw new Error("Failed to fetch response from AI.");
//   }
// }

if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    "The OPENAI_API_KEY environment variable is missing or empty."
  );
}

// Initialize the OpenAI client with the API key from environment variables
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the TypeScript type for the function response
export interface AIResponse {
  role: string;
  content: string;
}

// Async function to interact with OpenAI's API
export async function getAIResponse(userInput: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
              You are a precise assistant. Only respond with explicit data requests or simple responses.
              Guidelines:
              - Do not hallucinate or make assumptions.
              - Respond with JSON data if requesting information from external APIs.
            `,
        },
        { role: "user", content: userInput },
      ],
    });

    const aiMessage = response.choices[0].message?.content;

    console.log("AI Response:", aiMessage); // Log the AI response

    if (!aiMessage) {
      throw new Error("AI response was empty or undefined");
    }

    return { message: aiMessage };
  } catch (error: any) {
    console.error("Error in getAIResponse:", error);
    throw new Error(`OpenAI API Error: ${error.message || "Unknown error"}`);
  }
}
