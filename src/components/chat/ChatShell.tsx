'use client';

import { useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import {
  Brain,
  Check,
  Circle,
  MessageSquare,
  RefreshCcw,
  Sparkles,
  StopCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useChatEngine } from "@/components/chat/useChatEngine";
import { usePersonaStore } from "@/store/usePersonaStore";
import { useMemoryStore } from "@/store/useMemoryStore";
import { useSessionStore } from "@/store/useSessionStore";
import type { ChatMessage } from "@/lib/types";
import { MessageList } from "./MessageList";
import { PersonaPanel } from "./PersonaPanel";
import { MemoryPanel } from "./MemoryPanel";
import { SessionSidebar } from "./SessionSidebar";

const DEFAULT_MODEL = "Llama-3-8B-Instruct-q4f16_1-MLC";

export function ChatShell() {
  const { persona } = usePersonaStore();
  const { memories } = useMemoryStore();
  const {
    sessions,
    activeSessionId,
    hydrateInitial,
    appendMessage,
    updateMessage,
    createSession,
    selectSession
  } = useSessionStore();

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions]
  );

  useEffect(() => {
    hydrateInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [input, setInput] = useState("");
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([]);
  const [temperature, setTemperature] = useState(0.6);
  const [maxTokens, setMaxTokens] = useState(512);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );

  const selectedMemories = memories
    .filter((memory) => selectedMemoryIds.includes(memory.id))
    .map((memory) => `${memory.title}: ${memory.details}`);

  useEffect(() => {
    if (memories.length > 0 && selectedMemoryIds.length === 0) {
      setSelectedMemoryIds(memories.slice(0, 3).map((memory) => memory.id));
    }
  }, [memories, selectedMemoryIds.length]);

  useEffect(() => {
    setSelectedMemoryIds((previous) =>
      previous.filter((id) => memories.some((memory) => memory.id === id))
    );
  }, [memories]);

  const { status, progress, error, sendMessage, stop } = useChatEngine({
    model,
    temperature,
    maxTokens
  });

  const isGenerating = status === "generating";
  const canInteract = Boolean(activeSession) && status !== "initializing";

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!activeSession) return;

    const content = input.trim();
    setInput("");
    setStatusMessage("Synthesizing insight...");

    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content,
      createdAt: Date.now()
    };

    const assistantMessage: ChatMessage = {
      id: nanoid(),
      role: "assistant",
      content: "",
      createdAt: Date.now()
    };

    const conversation = [...(activeSession.messages ?? []), userMessage];

    appendMessage(activeSession.id, userMessage);
    appendMessage(activeSession.id, assistantMessage);
    setStreamingMessageId(assistantMessage.id);

    let assembled = "";

    await sendMessage({
      persona,
      memories: selectedMemories,
      conversation,
      input: content,
      onToken: (delta) => {
        assembled += delta;
        updateMessage(activeSession.id, assistantMessage.id, {
          content: assembled
        });
      },
      onComplete: (full) => {
        assembled = full;
        updateMessage(activeSession.id, assistantMessage.id, { content: full });
        setStreamingMessageId(null);
        setStatusMessage("Response ready.");
      },
      onError: (message) => {
        updateMessage(activeSession.id, assistantMessage.id, {
          content: `⚠️ ${message}`
        });
        setStreamingMessageId(null);
        setStatusMessage(message);
      }
    });
  };

  return (
    <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[260px,minmax(0,1fr),320px]">
      <SessionSidebar status={status} progress={progress} error={error} />
      <div className="glass relative flex h-[calc(100vh-220px)] flex-1 flex-col rounded-3xl border border-white/5 p-6 shadow-xl">
        <header className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-primary/70">
              Private Intelligence
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              {persona.name}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="h-4 w-4 text-primary" />
            <span className="capitalize">{status}</span>
            {status === "initializing" ? (
              <div className="flex items-center gap-1">
                <span>{Math.round(progress * 100)}%</span>
              </div>
            ) : status === "ready" ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : status === "generating" ? (
              <Sparkles className="h-4 w-4 animate-pulse text-sky-300" />
            ) : (
              <Circle className="h-3 w-3 text-slate-500" />
            )}
          </div>
        </header>

        <div className="mb-4 flex flex-col gap-3 lg:hidden">
          <div className="flex items-center gap-3">
            <label className="text-xs uppercase tracking-[0.28em] text-white/40">
              Session
            </label>
            <select
              value={activeSession?.id ?? ""}
              onChange={(event) => selectSession(event.target.value)}
              className="flex-1 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white focus:outline-none disabled:opacity-60"
              disabled={sessions.length === 0}
            >
              {sessions.length === 0 ? (
                <option value="">No sessions yet</option>
              ) : (
                sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))
              )}
            </select>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-full border border-white/10 bg-black/40 text-sm text-white/70"
            onClick={() => {
              const session = createSession("New Strategy Thread");
              selectSession(session.id);
            }}
          >
            New Session
          </Button>
        </div>

        <MessageList
          sessionId={activeSession?.id ?? "default"}
          messages={activeSession?.messages ?? []}
          streamingMessageId={streamingMessageId}
        />

        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!isGenerating) {
              handleSend();
            }
          }}
        >
          <Textarea
            placeholder={
              canInteract
                ? "Ask anything. Configure your world on the right."
                : "Engine is preparing..."
            }
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (!isGenerating && canInteract) {
                  handleSend();
                }
              }
            }}
            disabled={!canInteract || isGenerating}
            className="min-h-[120px] resize-none bg-black/30 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <label className="flex items-center gap-2">
                <span>Temperature</span>
                <Input
                  type="number"
                  step={0.1}
                  min={0}
                  max={1.5}
                  value={temperature}
                  onChange={(event) =>
                    setTemperature(parseFloat(event.target.value) || 0.6)
                  }
                  className="w-20 bg-black/40"
                />
              </label>
              <label className="flex items-center gap-2">
                <span>Max tokens</span>
                <Input
                  type="number"
                  min={32}
                  max={2048}
                  value={maxTokens}
                  onChange={(event) =>
                    setMaxTokens(parseInt(event.target.value, 10) || 512)
                  }
                  className="w-24 bg-black/40"
                />
              </label>
              <label className="flex items-center gap-2">
                <span>Model</span>
                <Input
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className="w-72 bg-black/40"
                />
              </label>
            </div>
            <div className="flex items-center gap-2">
              {isGenerating ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    stop();
                    setStatusMessage("Generation interrupted.");
                  }}
                  className="gap-2 bg-red-500/20 text-red-200 hover:bg-red-500/30"
                >
                  <StopCircle className="h-4 w-4" />
                  Stop
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="gap-2 bg-primary/90 hover:bg-primary"
                  disabled={!canInteract}
                >
                  <Sparkles className="h-4 w-4" />
                  Engage
                </Button>
              )}
            </div>
          </div>
          {statusMessage && (
            <p className="text-xs text-muted-foreground">{statusMessage}</p>
          )}
          {error && (
            <p className="text-xs text-destructive-foreground">{error}</p>
          )}
        </form>
      </div>
      <div className="flex flex-col gap-4">
        <PersonaPanel />
        <MemoryPanel
          selectedIds={selectedMemoryIds}
          onToggle={(id) =>
            setSelectedMemoryIds((previous) =>
              previous.includes(id)
                ? previous.filter((item) => item !== id)
                : [...previous, id]
            )
          }
        />
        <div className="glass rounded-3xl border border-white/5 p-5 text-sm text-muted-foreground">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
            <MessageSquare className="h-4 w-4" />
            Session Tips
          </div>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Customize persona tone to shift Astra into different expert
              archetypes.
            </li>
            <li>
              Capture personal facts as memories for grounded, private context.
            </li>
            <li>
              Manage conversations on the left sidebar to switch missions.
            </li>
          </ul>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.location.reload()}
          className="glass w-full justify-center gap-2 rounded-3xl border border-white/10 bg-white/[0.04] py-6 text-muted-foreground hover:bg-white/[0.08]"
        >
          <RefreshCcw className="h-4 w-4" />
          Reload Runtime
        </Button>
      </div>
    </div>
  );
}
