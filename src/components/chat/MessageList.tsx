'use client';

import { useEffect, useRef } from "react";
import { Sparkles, User } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MessageListProps {
  sessionId: string;
  messages: ChatMessage[];
  streamingMessageId: string | null;
}

export function MessageList({
  sessionId,
  messages,
  streamingMessageId
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessionId, messages.length, streamingMessageId]);

  if (!messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
        <div className="max-w-sm space-y-3">
          <div className="flex justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <p className="font-semibold text-white/80">
            Welcome to your private intelligence space.
          </p>
          <p>
            Set the tone, highlight memories, and ask anything. Responses happen
            locally on your device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="scrollbar-thin mt-6 flex-1 space-y-4 overflow-y-auto pr-2"
    >
      {messages.map((message) => {
        const isUser = message.role === "user";
        return (
          <div
            key={message.id}
            className={cn(
              "flex w-full animate-fade-in gap-3",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            {!isUser && (
              <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow",
                isUser
                  ? "ml-auto rounded-br-lg bg-primary/90 text-primary-foreground shadow-primary/30"
                  : "glass border border-white/10 text-white/90"
              )}
            >
              <div className="whitespace-pre-wrap">
                {message.content || (streamingMessageId === message.id ? "…" : "")}
              </div>
              <div className="mt-2 text-[0.65rem] uppercase tracking-wide text-white/40">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>
            </div>
            {isUser && (
              <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
