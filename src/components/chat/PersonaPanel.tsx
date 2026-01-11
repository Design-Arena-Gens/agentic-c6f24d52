'use client';

import { useState } from "react";
import { Sparkles, Undo2 } from "lucide-react";
import { usePersonaStore } from "@/store/usePersonaStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function PersonaPanel() {
  const { persona, updatePersona, resetPersona } = usePersonaStore();
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  return (
    <div className="glass rounded-3xl border border-white/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
          <Sparkles className="h-4 w-4" />
          Persona
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-white"
          onClick={() => resetPersona()}
        >
          <Undo2 className="h-3 w-3" />
          Reset
        </Button>
      </div>
      <div className="space-y-4 text-sm">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.28em] text-white/40">
            Call Sign
          </label>
          <Input
            value={persona.name}
            onChange={(event) => updatePersona({ name: event.target.value })}
            className="bg-black/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.28em] text-white/40">
            Persona Description
          </label>
          <Textarea
            value={persona.description}
            onChange={(event) =>
              updatePersona({ description: event.target.value })
            }
            className="min-h-[90px] bg-black/30"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/40">
            <span>Directive Prompt</span>
            <button
              type="button"
              onClick={() => setIsEditingPrompt((value) => !value)}
              className="text-[0.7rem] font-semibold tracking-wide text-primary hover:text-primary/80"
            >
              {isEditingPrompt ? "Hide" : "Edit"}
            </button>
          </div>
          {isEditingPrompt ? (
            <Textarea
              value={persona.systemPrompt}
              onChange={(event) =>
                updatePersona({ systemPrompt: event.target.value })
              }
              className="min-h-[140px] bg-black/30"
            />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-relaxed text-muted-foreground">
              {persona.systemPrompt}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
