'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { MemoryItem } from "@/lib/types";

interface MemoryStore {
  memories: MemoryItem[];
  addMemory: (input: Omit<MemoryItem, "id" | "createdAt">) => MemoryItem;
  updateMemory: (id: string, changes: Partial<MemoryItem>) => void;
  removeMemory: (id: string) => void;
  clearMemories: () => void;
}

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set) => ({
      memories: [],
      addMemory: (input) => {
        const memory: MemoryItem = {
          id: nanoid(),
          createdAt: Date.now(),
          ...input
        };
        set((state) => ({
          memories: [memory, ...state.memories].slice(0, 100)
        }));
        return memory;
      },
      updateMemory: (id, changes) =>
        set((state) => ({
          memories: state.memories.map((memo) =>
            memo.id === id ? { ...memo, ...changes } : memo
          )
        })),
      removeMemory: (id) =>
        set((state) => ({
          memories: state.memories.filter((memo) => memo.id !== id)
        })),
      clearMemories: () => set({ memories: [] })
    }),
    {
      name: "private-ai-memories"
    }
  )
);
