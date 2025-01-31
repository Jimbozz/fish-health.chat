"use client";

import { useChat } from "ai/react";
import { Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import axios from "axios";
import { getBwToken } from "@/lib/utils";

const welcomeMessage: { id: string; role: "assistant"; content: string } = {
  id: "welcome-message",
  role: "assistant",
  content:
    "Hi there, ask me anything about fish health in Norway and I'll do my best to help you out!",
};

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      initialMessages: [welcomeMessage],
      streamProtocol: "text",
      onResponse: (response) => {
        console.log("Response from backend:", response); // Log raw response
      },
      onError: (error) => {
        console.error("Error in useChat:", error);
      },
    });

  const [streamedContent, setStreamedContent] = useState("");

  useEffect(() => {
    if (isLoading && streamedContent) {
      setStreamedContent((prev) => prev + streamedContent);
    }
  }, [isLoading, streamedContent]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className='w-full border-2'>
      <ScrollArea
        ref={scrollAreaRef}
        className='h-[70vh] p-4 rounded-t-lg bg-muted/50'
      >
        <div
          className='space-y-4'
          aria-live='polite' // Accessibility: Announce changes
          aria-relevant='additions'
        >
          {messages
            .filter(
              (
                message
              ): message is {
                id: string;
                role: "assistant" | "user";
                content: string;
              } => message.role === "user" || message.role === "assistant"
            )
            .map((message, index) => (
              <ChatMessage
                key={message.id || index} // Use unique `id` or fallback to index
                role={message.role}
                content={message.content}
              />
            ))}

          {isLoading && (
            <div
              className='flex items-center gap-2 text-muted-foreground'
              aria-live='polite'
              aria-busy='true' // Accessibility: Announce loading
            >
              <Bot className='h-4 w-4 animate-spin' />
              <p className='text-sm'>Crafting a response...</p>
            </div>
          )}

          {error && (
            <div className='text-red-500 text-sm'>
              Oops! Something went wrong. Please try again.
            </div>
          )}
        </div>
      </ScrollArea>

      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </Card>
  );
}

async function testFetchFishHealthData() {
  const queryParams = {
    query: "Aarset",
  };
  const apiUrl = "https://www.barentswatch.no/bwapi/v1";

  try {
    // Fetch the token from your API route
    const response = await fetch("/api/get-bw-token", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch BW token");
    }

    const data = await response.json();
    const BwToken = data.access_token;

    console.log("BW Token:", BwToken);

    // Now use the token to make your data request
    const fishHealthResponse = await axios.get(
      `${apiUrl}/geodata/fishhealth/localities`,
      {
        params: queryParams,
        headers: {
          Authorization: `Bearer ${BwToken}`,
        },
      }
    );

    if (!fishHealthResponse.data) {
      console.error("No locality data found");
      return;
    }

    console.log("Fish health data:", fishHealthResponse.data);
    return fishHealthResponse.data;
  } catch (error: any) {
    console.error(
      "Error fetching fish health data:",
      error.response?.data || error.message
    );
  }
}

// Call the function and handle it appropriately
testFetchFishHealthData().catch((error) => {
  console.error("Unhandled error in testFetchFishHealthData:", error);
});
