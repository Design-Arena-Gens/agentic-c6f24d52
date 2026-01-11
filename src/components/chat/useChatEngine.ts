'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadWebLLM,
  type ChatCompletionMessageParam,
  type InitProgressReport,
  type MLCEngine
} from "@/lib/webllm-loader";
import type { ChatMessage, PersonaSettings } from "@/lib/types";

export type EngineStatus =
  | "idle"
  | "initializing"
  | "ready"
  | "error"
  | "generating";

interface UseChatEngineOptions {
  model: string;
  temperature: number;
  maxTokens: number;
}

interface SendMessageOptions {
  persona: PersonaSettings;
  memories: string[];
  conversation: ChatMessage[];
  input: string;
  onToken: (token: string) => void;
  onComplete: (content: string) => void;
  onError: (message: string) => void;
}

interface UseChatEngineResult {
  status: EngineStatus;
  progress: number;
  error: string | null;
  sendMessage: (options: SendMessageOptions) => Promise<void>;
  stop: () => void;
  engine: MLCEngine | null;
}

export const useChatEngine = (
  options: UseChatEngineOptions
): UseChatEngineResult => {
  const [engine, setEngine] = useState<MLCEngine | null>(null);
  const [status, setStatus] = useState<EngineStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const initialize = useCallback(async () => {
    setStatus("initializing");
    setProgress(0);
    setError(null);
    try {
      setEngine((current) => {
        current?.dispose?.();
        return null;
      });
      const { CreateMLCEngine } = await loadWebLLM();
      const instance = await CreateMLCEngine(options.model, {
        initProgressCallback: (report: InitProgressReport) => {
          if (report.total != null && report.total > 0) {
            setProgress(Math.min(1, (report.progress ?? 0) / report.total));
          } else if (typeof report.progress === "number") {
            setProgress((prev) =>
              Math.max(prev, Math.min(1, report.progress ?? 0))
            );
          }
        }
      });
      setEngine(instance);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize the local intelligence engine."
      );
      setStatus("error");
    }
  }, [options.model]);

  useEffect(() => {
    initialize();
    return () => {
      abortRef.current?.abort();
    };
  }, [initialize]);

  useEffect(() => {
    return () => {
      engine?.dispose?.();
    };
  }, [engine]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    engine?.interruptGenerate?.();
    setStatus((value) => (value === "generating" ? "ready" : value));
  }, [engine]);

  const sendMessage = useCallback(
    async ({
      persona,
      memories,
      conversation,
      input,
      onToken,
      onComplete,
      onError
    }: SendMessageOptions) => {
      if (!engine) {
        onError("The intelligence engine is still warming up. Please wait.");
        return;
      }

      abortRef.current?.abort();
      const abortController = new AbortController();
      abortRef.current = abortController;

      const assembledMessages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: persona.systemPrompt
        },
        ...memories.map<ChatCompletionMessageParam>((memory) => ({
          role: "system",
          content: `Context memory: ${memory}`
        })),
        ...conversation.map((message) => ({
          role: message.role,
          content: message.content
        })),
        {
          role: "user",
          content: input
        }
      ];

      setStatus("generating");

      try {
        const stream = await engine.chat.completions.create({
          stream: true,
          messages: assembledMessages,
          temperature: options.temperature,
          max_tokens: options.maxTokens
        });

        let response = "";
        for await (const chunk of stream) {
          if (abortController.signal.aborted) {
            break;
          }
          const delta = chunk.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            response += delta;
            onToken(delta);
          }
          if (chunk.choices?.[0]?.finish_reason) {
            break;
          }
        }
        onComplete(response.trim());
        abortRef.current = null;
        setStatus("ready");
      } catch (err) {
        if (abortController.signal.aborted) {
          abortRef.current = null;
          setStatus("ready");
          return;
        }

        console.error(err);
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong while generating a response.";
        onError(message);
        setError(message);
        abortRef.current = null;
        setStatus("error");
      }
    },
    [engine, options.maxTokens, options.temperature]
  );

  return {
    status,
    progress,
    error,
    sendMessage,
    stop,
    engine
  };
};
