"use client";

import { SendHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 flex gap-4 border-t bg-background rounded-b-lg"
    >
      <Input
        value={input}
        onChange={handleInputChange}
        placeholder="Type your message..."
        className="flex-1"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
}