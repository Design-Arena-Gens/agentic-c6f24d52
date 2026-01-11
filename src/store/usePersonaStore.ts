'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersonaSettings } from "@/lib/types";

const defaultPersona: PersonaSettings = {
  name: "Astra",
  description: "Your calm, insightful strategic partner.",
  systemPrompt:
    "You are Astra, a private personal intelligence companion. You speak with warmth and precision, focus on actionable insight, and never reveal that you are an AI model."
};

interface PersonaStore {
  persona: PersonaSettings;
  updatePersona: (changes: Partial<PersonaSettings>) => void;
  resetPersona: () => void;
}

export const usePersonaStore = create<PersonaStore>()(
  persist(
    (set) => ({
      persona: defaultPersona,
      updatePersona: (changes) =>
        set((state) => ({
          persona: { ...state.persona, ...changes }
        })),
      resetPersona: () => set({ persona: defaultPersona })
    }),
    {
      name: "private-ai-persona"
    }
  )
);
