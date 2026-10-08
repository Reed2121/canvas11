import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Sign in — Final Fight" },
    { name: "description", content: "Sign in to play ranked and climb the Final Fight ladder." },
    { property: "og:title", content: "Sign in — Final Fight" },
    { property: "og:description", content: "Create an account to play ranked matches." },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { username } } });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Account created — you're signed in!");
      nav({ to: "/" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      nav({ to: "/" });
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { toast.error("Google sign-in failed"); return; }
    if (!r.redirected) nav({ to: "/" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-black italic text-primary">{mode === "in" ? "SIGN IN" : "CREATE ACCOUNT"}</h1>
        {mode === "up" && <input required minLength={3} maxLength={16} pattern="[A-Za-z0-9_]+" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2" />}
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2" />
        <input required type="password" minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2" />
        <button disabled={busy} className="w-full rounded-md bg-primary py-2 font-bold text-primary-foreground">{mode === "in" ? "Sign in" : "Sign up"}</button>
        <button type="button" onClick={google} className="w-full rounded-md border border-border py-2 font-bold">Continue with Google</button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-sm text-muted-foreground">{mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}</button>
        <Link to="/" className="block text-center text-sm text-secondary">← Back to game</Link>
      </form>
    </main>
  );
}
