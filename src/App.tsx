import { ChatShell } from "@/components/chat/ChatShell";

function App() {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.25)_0%,_rgba(8,47,73,0)_60%)] text-foreground antialiased">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(226,232,240,0.08),transparent_35%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-12 pt-8 sm:px-8 md:px-12 lg:px-16">
          <header className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-primary/70">
              Astra OS · Personal Intelligence Console
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                  Your Private Smart AI
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Run a self-contained intelligence node that shapes itself to your
                  goals. Nothing leaves the browser—memories, persona, and context are
                  yours alone.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-muted-foreground">
                WebGPU compatible browsers provide the best experience. First load
                may take a moment while the local model warms up.
              </div>
            </div>
          </header>
          <div className="mt-8 flex-1">
            <ChatShell />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
