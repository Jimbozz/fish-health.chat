import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import OpenAI from "openai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getBwToken() {
  try {
    const response = await fetch("/api/get-bw-token", {
      method: "POST",
    });
    console.log(response);

    if (!response.ok) {
      throw new Error("Failed to fetch token");
    }

    const data = await response.json();
    console.log("Token:", data.access_token);
    return data.access_token;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in getToken:", error.message);
    } else {
      console.error("Error in getToken:", error);
    }
    throw error;
  }
}
