'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { ChatMessage, SessionState } from "@/lib/types";

interface SessionStore {
  sessions: SessionState[];
  activeSessionId: string | null;
  createSession: (title?: string) => SessionState;
  selectSession: (id: string) => void;
  removeSession: (id: string) => void;
  upsertMessages: (id: string, messages: ChatMessage[]) => void;
  appendMessage: (id: string, message: ChatMessage) => void;
  updateMessage: (id: string, messageId: string, changes: Partial<ChatMessage>) => void;
  renameSession: (id: string, title: string) => void;
  hydrateInitial: () => SessionState;
}

const createEmptySession = (title?: string): SessionState => {
  const now = Date.now();
  return {
    id: nanoid(),
    title: title ?? "New Session",
    messages: [],
    createdAt: now,
    updatedAt: now
  };
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      createSession: (title) => {
        const session = createEmptySession(title);
        set((state) => ({
          sessions: [session, ...state.sessions],
          activeSessionId: session.id
        }));
        return session;
      },
      selectSession: (id) => set({ activeSessionId: id }),
      removeSession: (id) =>
        set((state) => {
          const sessions = state.sessions.filter((session) => session.id !== id);
          const activeSessionId =
            state.activeSessionId === id
              ? sessions[0]?.id ?? null
              : state.activeSessionId;
          return { sessions, activeSessionId };
        }),
      upsertMessages: (id, messages) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  messages,
                  updatedAt: Date.now()
                }
              : session
          )
        })),
      appendMessage: (id, message) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  messages: [...session.messages, message],
                  updatedAt: Date.now()
                }
              : session
          )
        })),
      updateMessage: (id, messageId, changes) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  messages: session.messages.map((message) =>
                    message.id === messageId ? { ...message, ...changes } : message
                  ),
                  updatedAt: Date.now()
                }
              : session
          )
        })),
      renameSession: (id, title) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  title,
                  updatedAt: Date.now()
                }
              : session
          )
        })),
      hydrateInitial: () => {
        const { sessions, activeSessionId, createSession } = get();
        if (sessions.length === 0) {
          return createSession("First Conversation");
        }
        const active =
          sessions.find((session) => session.id === activeSessionId) ??
          sessions[0];
        set({ activeSessionId: active.id });
        return active;
      }
    }),
    {
      name: "private-ai-sessions"
    }
  )
);
