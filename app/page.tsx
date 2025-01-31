"use client";

import { Chat } from "@/components/chat";
import { ModeToggle } from "@/components/mode-toggle";
import { Bot, Code2, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center p-4 bg-background'>
      <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex'>
        <div className='flex items-center gap-2'>
          <Bot className='h-6 w-6' />
          <p className='font-semibold'>LICE WATCH</p>
        </div>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' asChild>
            <a
              href='https://github.com/[your-github]'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Github className='h-5 w-5' />
            </a>
          </Button>
          <Button variant='ghost' size='icon' asChild>
            <a
              href='https://linkedin.com/in/[your-linkedin]'
              target='_blank'
              rel='noopener noreferrer'
            >
              <Linkedin className='h-5 w-5' />
            </a>
          </Button>
          <ModeToggle />
        </div>
      </div>

      <div className='relative flex flex-col items-center mt-8 text-center'>
        <p className='text-lg text-muted-foreground max-w-3xl'>
          Fish health chatbot is a chatbot that can help you diagnose your fish
        </p>
      </div>

      <div className='mb-32 mt-12 grid text-center lg:max-w-3xl lg:w-full lg:mb-0 lg:text-left'>
        <Chat />
      </div>
    </main>
  );
}
