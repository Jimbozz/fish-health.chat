import { NextResponse } from "next/server";

export async function POST() {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const tokenUrl = "https://id.barentswatch.no/connect/token";

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: "client_credentials",
        scope: "api",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to fetch token" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching token:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
