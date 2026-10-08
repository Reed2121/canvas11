import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Final Fight — Online Arena Brawler" },
      { name: "description", content: "Free browser arena brawler. Fight the CPU, a friend, or real players online." },
      { property: "og:title", content: "Final Fight — Online Arena Brawler" },
      { property: "og:description", content: "Launch your rivals off the stage. Play free in your browser with online matches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/game.html"
      title="Final Fight"
      className="fixed inset-0 block h-screen w-screen border-0 bg-background"
      allow="autoplay"
      autoFocus
    />
  );
}
