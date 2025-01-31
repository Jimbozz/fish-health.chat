import axios from "axios";

interface FishHealthData {
  liceLevel: string;
}

interface LocalityData {
  localityName: string;
  localityNo: string;
  municipalityNumber: string;
}

export async function fetchFishHealthData(queryParams: {
  location: string;
  fishType: string;
  focus: string;
}): Promise<LocalityData | null> {
  const apiUrl = "https://www.barentswatch.no/bwapi/v1";

  try {
    // Fetch the token from your API route
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
export async function fetchSalmonLiceData(
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
