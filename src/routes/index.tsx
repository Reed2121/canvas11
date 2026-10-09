import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlayer } from "@/hooks/use-player";
import { rankKey, rankName } from "@/lib/rank";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Final Fight — Online Arena Brawler" },
      { name: "description", content: "Free browser arena brawler with online ranked matches. Climb from Bronze to Legend." },
      { property: "og:title", content: "Final Fight — Online Arena Brawler" },
      { property: "og:description", content: "Launch your rivals off the stage and climb the ranked ladder to Legend." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const frame = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  const { player, refresh } = usePlayer();
  const playerRef = useRef(player);
  playerRef.current = player;

  const sendAuth = () => {
    frame.current?.contentWindow?.postMessage(
      { type: "ff-auth", me: playerRef.current },
      window.location.origin,
    );
  };

  useEffect(sendAuth, [player]);

  useEffect(() => {
    const onMsg = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !e.data) return;
      if (e.data.type === "ff-ready") sendAuth();
      if (e.data.type === "ff-signin") navigate({ to: "/auth" });
      if (e.data.type === "ff-tour") {
        const { data } = await supabase.rpc("report_tournament", { _rounds: Number(e.data.rounds) || 0 });
        const res = data as { applied?: boolean; points?: number } | null;
        await refresh();
        if (res?.applied) toast.success(`Ranked tournament: ${res.points! >= 0 ? "+" : ""}${res.points}`);
        else toast("Ranked tournament points are limited to one every 3 minutes.");
      }
      if (e.data.type === "ff-result") {
        const { match, opp, won } = e.data as { match: string; opp: string; won: boolean };
        const before = playerRef.current?.rating ?? 0;
        let applied = false;
        for (let i = 0; i < 6 && !applied; i++) {
          const { data } = await supabase.rpc("report_result", { _match: match, _opponent: opp, _won: won });
          applied = !!(data as { applied?: boolean } | null)?.applied;
          if (!applied) await new Promise((r) => setTimeout(r, 1500));
        }
        await refresh();
        if (applied || ratingChanged(before, playerRef.current?.rating)) {
          toast.success(won ? "Ranked win! +25" : "Ranked loss. −20");
        }
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [navigate, refresh]);

  return (
    <>
      <iframe
        ref={frame}
        src="/game.html"
        title="Final Fight"
        className="fixed inset-0 block h-screen w-screen border-0 bg-background"
        allow="autoplay"
        onLoad={sendAuth}
        autoFocus
      />
      <div className="fixed left-3 top-3 z-10 flex gap-2">
        <Link to="/leaderboard" className="hud-pill">🏆 Ladder</Link>
        {player ? (
          <Link to="/account" className="hud-pill">
            <span className={`rank-dot rank-${rankKey(player.rating, player.legend)}`} />
            {player.username} · {rankName(player.rating, player.legend)}
          </Link>
        ) : (
          <Link to="/auth" className="hud-pill">Sign in</Link>
        )}
      </div>
    </>
  );
}

function ratingChanged(before: number, after?: number) {
  return after !== undefined && after !== before;
}
