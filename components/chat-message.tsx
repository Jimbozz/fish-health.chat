"use client";

import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "assistant" | "user";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div
      className={`flex items-start gap-4 ${
        role === "assistant" ? "flex-row" : "flex-row-reverse text-right"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          role === "assistant"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        {role === "assistant" ? (
          <Bot className='h-4 w-4' />
        ) : (
          <User className='h-4 w-4' />
        )}
      </div>
      <div
        className={`rounded-lg px-4 py-2 max-w-[80%] ${
          role === "assistant"
            ? "bg-background shadow-sm"
            : "bg-primary text-primary-foreground"
        }`}
      >
        <ReactMarkdown
          className='prose dark:prose-invert max-w-none text-left'
          components={{
            pre: ({ node, ...props }) => (
              <div className='overflow-auto w-full my-2 bg-muted p-2 rounded-lg'>
                <pre {...props} />
              </div>
            ),
            code: ({ node, ...props }) => (
              <code className='bg-muted/50 rounded-sm px-1' {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
