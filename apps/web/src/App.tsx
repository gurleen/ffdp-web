import { Button, Input, Panel } from "@gurleen-ui/core";
import { useState } from "react";
import { orpc } from "./lib/orpc";

export function App() {
  const [name, setName] = useState("world");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGreet() {
    setLoading(true);
    try {
      const result = await orpc.greet({ name });
      setReply(result.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-neutral-100">
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-xl font-semibold">app-starter</h1>
        <p className="text-sm text-neutral-400">
          Bun · Vite · React · Tailwind CSS · oRPC · @gurleen-ui/core
        </p>

        <Panel title="oRPC demo" meta="apps/server">
          <div className="flex flex-col gap-3">
            <Input label="Name" value={name} onChange={setName} />
            <Button
              label={loading ? "Calling…" : "Greet"}
              variant="accent"
              onClick={handleGreet}
              disabled={loading}
            />
            {reply && (
              <p data-testid="greet-reply" className="text-sm text-neutral-300">
                {reply}
              </p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
