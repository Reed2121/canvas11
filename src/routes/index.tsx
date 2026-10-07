import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Final Fight — Online Arena Brawler" },
      { name: "description", content: "Free browser arena brawler. Fight the CPU, a friend on one keyboard, or real players online." },
      { property: "og:title", content: "Final Fight — Online Arena Brawler" },
      { property: "og:description", content: "Launch your rivals off the stage. Play free in your browser — now with online matches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FIGHTERS = [
  { n: "Blaze", c: "var(--f-blaze)", d: "All-rounder with heavy hits" },
  { n: "Frost", c: "var(--f-frost)", d: "Ranged ice specialist" },
  { n: "Verdant", c: "var(--f-verdant)", d: "Heavy and hard to launch" },
  { n: "Volt", c: "var(--f-volt)", d: "Fastest fighter in the arena" },
  { n: "Angelic", c: "var(--f-angelic)", d: "Spear, flight & light beam" },
  { n: "Fixer", c: "var(--f-fixer)", d: "Random builds: guns, bombs, blades" },
  { n: "Soar", c: "var(--f-soar)", d: "Gales, talons and cyclones" },
];

const CONTROLS = [
  ["A / D", "Move"], ["W", "Jump / double jump"], ["S", "Drop through"],
  ["1", "Dash"], ["2", "Light attack"], ["3", "Heavy attack"],
  ["4", "Projectile"], ["5", "Ultimate"], ["Esc", "Pause / leave"],
];

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-display text-2xl italic tracking-wider text-gradient-fire">FINAL FIGHT</span>
        <a href="#play" className="rounded-md bg-primary px-4 py-2 font-bold text-primary-foreground transition hover:-translate-y-0.5">Play now</a>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-6 text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.4em] text-accent">Arena brawler · Free in your browser</p>
        <h1 className="font-display text-6xl italic leading-none md:text-8xl">
          <span className="text-gradient-fire">KNOCK THEM</span><br />
          <span className="text-gradient-ice">OFF THE MAP</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Seven fighters, three arenas, one rule: the higher their damage, the farther they fly. Battle the CPU, a friend on the same keyboard, or real players online.
        </p>
      </section>

      <section id="play" className="mx-auto max-w-6xl scroll-mt-6 px-4">
        <div className="overflow-hidden rounded-2xl border-2 border-border shadow-glow">
          <iframe src="/game.html" title="Final Fight game" className="block aspect-video w-full bg-card" allow="autoplay" />
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Click the game first so it hears your keyboard. For online: Play → Online → Quick Match, or create a room and share the code.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl italic text-secondary">Controls</h2>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {CONTROLS.map(([k, v]) => (
              <div key={k} className="flex items-center gap-3 rounded-lg bg-card px-3 py-2">
                <kbd className="min-w-14 rounded bg-muted px-2 py-1 text-center font-mono text-sm font-bold">{k}</kbd>
                <span className="text-sm">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Arrow keys work too. Fill your power bar by landing hits.</p>
        </div>
        <div>
          <h2 className="font-display text-3xl italic text-secondary">Fighters</h2>
          <ul className="mt-5 space-y-2">
            {FIGHTERS.map((f) => (
              <li key={f.n} className="flex items-center gap-3 rounded-lg bg-card px-3 py-2">
                <span className="h-4 w-4 rounded-full" style={{ background: f.c }} />
                <b style={{ color: f.c }}>{f.n}</b>
                <span className="text-sm text-muted-foreground">{f.d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="pb-10 text-center text-sm text-muted-foreground">Final Fight · Online matches connect you directly to your opponent.</footer>
    </main>
  );
}
