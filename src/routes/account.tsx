import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { usePlayer } from "@/hooks/use-player";
import { rankName, rankProgress } from "@/lib/rank";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [
    { title: "Your Account — Final Fight" },
    { name: "description", content: "Your Final Fight rank and record." },
    { property: "og:title", content: "Your Account — Final Fight" },
    { property: "og:description", content: "Your rank and ranked record." },
  ] }),
  component: Account,
});

function Account() {
  const nav = useNavigate();
  const { player, ready } = usePlayer();
  return (
    <main className="mx-auto min-h-screen max-w-md bg-background p-6">
      <Link to="/" className="text-sm text-secondary">← Back to game</Link>
      {!ready ? <p className="mt-4">Loading…</p> : !player ? (
        <p className="mt-4">Not signed in. <Link to="/auth" className="text-primary">Sign in</Link></p>
      ) : (
        <div className="mt-4 space-y-3 rounded-2xl bg-card p-6">
          <h1 className="text-3xl font-black italic">{player.username}</h1>
          <p className="text-xl font-bold text-primary">{rankName(player.rating, player.legend)}</p>
          <div className="h-2 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${rankProgress(player.rating)}%` }} /></div>
          <p className="text-sm text-muted-foreground">{player.rating} points · {player.wins} wins · {player.losses} losses</p>
          <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/", replace: true }); }} className="rounded-md border border-border px-4 py-2 font-bold">Sign out</button>
        </div>
      )}
    </main>
  );
}
