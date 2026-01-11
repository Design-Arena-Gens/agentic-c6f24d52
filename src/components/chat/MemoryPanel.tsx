'use client';

import { useState } from "react";
import { Archive, Check, Plus, Tag, Trash2 } from "lucide-react";
import { useMemoryStore } from "@/store/useMemoryStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MemoryPanelProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function MemoryPanel({ selectedIds, onToggle }: MemoryPanelProps) {
  const { memories, addMemory, removeMemory } = useMemoryStore();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [tags, setTags] = useState("");

  const handleAdd = () => {
    if (!title.trim() || !details.trim()) return;
    const parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    addMemory({
      title: title.trim(),
      details: details.trim(),
      tags: parsedTags
    });
    setTitle("");
    setDetails("");
    setTags("");
  };

  return (
    <div className="glass flex flex-col gap-4 rounded-3xl border border-white/5 p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
        <Archive className="h-4 w-4" />
        Private Memory
      </div>
      <div className="space-y-3 text-sm">
        <Input
          placeholder="Memory headline"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="bg-black/30"
        />
        <Textarea
          placeholder="Context or facts you want Astra to remember."
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          className="min-h-[90px] bg-black/30"
        />
        <Input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          className="bg-black/30"
        />
        <Button
          type="button"
          onClick={handleAdd}
          className="w-full gap-2 bg-primary/80 hover:bg-primary"
        >
          <Plus className="h-4 w-4" />
          Store Memory
        </Button>
      </div>

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.28em] text-white/40">
          Activated Context
        </div>
        {memories.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
            Add knowledge you want Astra to surface during conversations. toggle
            a memory to include or exclude it.
          </div>
        ) : (
          <div className="scrollbar-thin space-y-2 overflow-y-auto pr-1">
            {memories.map((memory) => {
              const isSelected = selectedIds.includes(memory.id);
              return (
                <div
                  key={memory.id}
                  className={cn(
                    "group rounded-2xl border border-white/10 bg-black/20 p-4 transition-colors",
                    isSelected ? "border-primary/40 bg-primary/10" : undefined
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        {memory.title}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {memory.details}
                      </p>
                      {memory.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-wide text-primary/70">
                          {memory.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-2 py-0.5"
                            >
                              <Tag className="h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? "default" : "secondary"}
                        className={cn(
                          "h-8 gap-1 text-xs",
                          isSelected
                            ? "bg-primary/80 hover:bg-primary"
                            : "bg-black/40 text-white/70 hover:text-white"
                        )}
                        onClick={() => onToggle(memory.id)}
                      >
                        <Check className="h-3 w-3" />
                        {isSelected ? "Active" : "Activate"}
                      </Button>
                      <button
                        type="button"
                        onClick={() => removeMemory(memory.id)}
                        className="text-xs text-red-300/60 hover:text-red-300"
                      >
                        <Trash2 className="mr-1 inline-block h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-[0.65rem] text-white/30">
                    Stored {new Date(memory.createdAt).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
