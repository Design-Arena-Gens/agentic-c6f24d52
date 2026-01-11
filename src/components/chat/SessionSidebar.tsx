'use client';

import { useState } from "react";
import { Layers, MessageSquare, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionStore } from "@/store/useSessionStore";
import { cn } from "@/lib/utils";
import type { EngineStatus } from "./useChatEngine";

interface SessionSidebarProps {
  status: EngineStatus;
  progress: number;
  error: string | null;
}

export function SessionSidebar({ status, progress, error }: SessionSidebarProps) {
  const {
    sessions,
    activeSessionId,
    createSession,
    selectSession,
    removeSession,
    renameSession
  } = useSessionStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <aside className="glass hidden h-[calc(100vh-220px)] flex-col rounded-3xl border border-white/5 p-5 shadow-xl lg:flex">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
          <Layers className="h-4 w-4" />
          Missions
        </div>
        <Button
          type="button"
          size="sm"
          className="h-8 gap-2 rounded-full bg-primary/90 px-3 text-xs font-semibold hover:bg-primary"
          onClick={() => {
            const session = createSession("New Strategy Thread");
            setEditingId(session.id);
          }}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          New
        </Button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          const isEditing = editingId === session.id;

          return (
            <button
              key={session.id}
              type="button"
              onClick={() => selectSession(session.id)}
              className={cn(
                "group relative w-full rounded-2xl border border-white/5 bg-black/30 p-4 text-left transition-all hover:border-primary/40 hover:bg-black/40",
                isActive && "border-primary/60 bg-primary/10"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {isEditing ? (
                    <Input
                      autoFocus
                      defaultValue={session.title}
                      className="h-8 bg-black/50 text-sm"
                      onBlur={(event) => {
                        renameSession(session.id, event.target.value || session.title);
                        setEditingId(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.currentTarget.blur();
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <MessageSquare className="h-4 w-4 text-primary/80" />
                      {session.title}
                    </div>
                  )}
                  <div className="mt-2 text-[0.65rem] uppercase tracking-wide text-white/40">
                    Updated {new Date(session.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8 rounded-full bg-black/40 px-3 text-xs text-muted-foreground hover:text-white"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingId(session.id);
                    }}
                  >
                    Rename
                  </Button>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-black/40 p-1 text-white/40 hover:text-red-400"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeSession(session.id);
                    }}
                    aria-label="Delete session"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Status</span>
          <span className="capitalize text-white/70">{status}</span>
        </div>
        {status === "initializing" && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-red-200">
            {error}
          </div>
        )}
      </div>
    </aside>
  );
}
