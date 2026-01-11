"use client";

export type ChatCompletionMessageParam = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface ChatCompletionChunk {
  choices?: Array<{
    delta?: {
      content?: string;
    };
    finish_reason?: string | null;
  }>;
}

export interface InitProgressReport {
  progress: number;
  timeElapsed?: number;
  total?: number;
  text?: string;
}

export interface MLCEngine {
  chat: {
    completions: {
      create: (params: {
        stream: true;
        messages: ChatCompletionMessageParam[];
        temperature?: number;
        max_tokens?: number;
      }) => Promise<AsyncIterable<ChatCompletionChunk>>;
    };
  };
  interruptGenerate: () => Promise<void> | void;
  dispose?: () => void;
}

export interface CreateMLCEngineConfig {
  initProgressCallback?: (report: InitProgressReport) => void;
  appConfig?: Record<string, unknown>;
}

export interface WebLLMModule {
  CreateMLCEngine: (
    modelId: string | string[],
    engineConfig?: CreateMLCEngineConfig,
    chatOpts?: unknown
  ) => Promise<MLCEngine>;
}

let cachedModule: WebLLMModule | null = null;

export async function loadWebLLM(): Promise<WebLLMModule> {
  if (cachedModule) {
    return cachedModule;
  }
  if (typeof window === "undefined") {
    throw new Error("WebLLM only loads in the browser.");
  }
  const moduleUrl = "https://esm.run/@mlc-ai/web-llm@0.2.46";
  const webllmModule = (await import(
    /* webpackIgnore: true */ moduleUrl
  )) as unknown as WebLLMModule;
  cachedModule = webllmModule;
  return webllmModule;
}
