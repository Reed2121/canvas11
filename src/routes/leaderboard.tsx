import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GM_RATING, LEGEND_SPOTS, rankKey, rankName } from "@/lib/rank";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [
    { title: "Ranked Ladder — Final Fight" },
    { name: "description", content: "Top Final Fight players, from Bronze to Legend." },
    { property: "og:title", content: "Ranked Ladder — Final Fight" },
    { property: "og:description", content: "See who holds the 25 Legend spots." },
  ] }),
  component: Board,
});

type Row = { id: string; username: string; rating: number; wins: number; losses: number };

function Board() {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    supabase.from("profiles").select("id, username, rating, wins, losses").order("rating", { ascending: false }).limit(100)
      .then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-background p-6">
      <Link to="/" className="text-sm text-secondary">← Back to game</Link>
      <h1 className="mt-2 text-3xl font-black italic text-primary">RANKED LADDER</h1>
      <p className="text-sm text-muted-foreground">Win +25, loss −20. 100 points per division. Legend = top {LEGEND_SPOTS} Grandmasters.</p>
      <ol className="mt-4 space-y-1">
        {rows === null && <li className="text-muted-foreground">Loading…</li>}
        {rows?.length === 0 && <li className="text-muted-foreground">No ranked players yet.</li>}
        {rows?.map((r, i) => {
          const legend = i < LEGEND_SPOTS && r.rating >= GM_RATING;
          return (
            <li key={r.id} className="flex items-center gap-3 rounded-lg bg-card px-3 py-2">
              <span className="w-6 text-right font-bold text-muted-foreground">{i + 1}</span>
              <span className={`rank-dot rank-${rankKey(r.rating, legend)}`} />
              <b className="flex-1">{r.username}</b>
              <span className="text-sm">{rankName(r.rating, legend)}</span>
              <span className="w-20 text-right text-sm text-muted-foreground">{r.rating} · {r.wins}W {r.losses}L</span>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
