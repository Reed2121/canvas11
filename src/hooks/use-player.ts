import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { GM_RATING, LEGEND_SPOTS } from "@/lib/rank";

export type Player = {
  id: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
  legend: boolean;
};

export async function fetchLegendIds(): Promise<Set<string>> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .gte("rating", GM_RATING)
    .order("rating", { ascending: false })
    .limit(LEGEND_SPOTS);
  return new Set((data ?? []).map((r) => r.id));
}

export function usePlayer() {
  const [user, setUser] = useState<User | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async (u: User | null) => {
    if (!u) {
      setPlayer(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, username, rating, wins, losses")
      .eq("id", u.id)
      .maybeSingle();
    if (!data) return setPlayer(null);
    const legends = data.rating >= GM_RATING ? await fetchLegendIds() : new Set<string>();
    setPlayer({ ...data, legend: legends.has(data.id) });
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setTimeout(() => void load(u), 0);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      void load(data.user).finally(() => setReady(true));
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  return { user, player, ready, refresh: () => load(user) };
}
