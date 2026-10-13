import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const html = readFileSync("public/game.html", "utf8");

function loadGame() {
  document.body.innerHTML = '<div id="w"><canvas id="c"></canvas><div id="m"></div></div>';
  const gradient = { addColorStop: () => undefined };
  const context = new Proxy({}, { get: (_, key) => key === "createLinearGradient" || key === "createRadialGradient" ? () => gradient : () => undefined, set: () => true });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as CanvasRenderingContext2D);
  vi.stubGlobal("requestAnimationFrame", () => 0);
  vi.stubGlobal("setInterval", () => 0);
  const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
  if (!script) throw new Error("Game script missing");
  return new Function(`${script}; return {
    start, enc, netApply, botDiff, rankName,
    setup: (mode, mapIndex) => { cfg.mode=mode; cfg.map=mapIndex; cfg.p1=11; cfg.p2=12; },
    peers: () => { NET={h:1,g:0,rh:{},och:12,c:{open:true,send:()=>{}}}; },
    snapshot: () => ({t:'s', d:enc({F,PR,EX,CIN,RET,FL,shake,stop,winner,scene,SPC,PETS,DOM,GH,EVS,terrainP:map.P,mi:cfg.map}, F)}),
    state: () => ({F,map,EVS,GH}),
    event: () => { EVS.nn='HIGH TIDE'; evStart(); terrain(); },
    effects: () => { GH=[{o:F[0],x:100,y:200,l:20}]; PETS=[{o:F[0],k:'clone',x:120,y:220,l:90}]; },
    preserved: () => ({netQuick,netRanked,tlOpen,tlCreate,tlJoin,tlStart,setS,SET}),
    skill: (rating) => { ME={rating}; SET.diff='rank'; return botDiff(); }
  };`)();
}

describe("Game update compatibility", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it("keeps new fighters and terrain synchronized through online snapshots", () => {
    const game = loadGame();
    game.setup("online", 3);
    game.peers();
    game.start();
    game.event();
    game.effects();
    const y = game.state().map.P[0].y;
    game.netApply(game.snapshot());
    const state = game.state();
    expect(state.F.map((f: { ch: { n: string } }) => f.ch.n)).toEqual(["Echo", "Bulwark"]);
    expect(state.F[1].ai).toBe(-3);
    expect(state.map.P[0].y).toBeCloseTo(y, 1);
    expect(state.EVS.name).toBe("HIGH TIDE");
    expect(state.GH[0].o).toBe(state.F[0]);
  });

  it("preserves ranked skill mapping and tournament room entry points", () => {
    const game = loadGame();
    expect(game.skill(0)).toBe(0);
    expect(game.skill(600)).toBe(1);
    expect(game.skill(1500)).toBe(2);
    expect(game.rankName(2100)).toBe("Grandmaster");
    expect(game.rankName(2100, true)).toBe("Legend");
    for (const key of ["netQuick", "netRanked", "tlOpen", "tlCreate", "tlJoin", "tlStart", "setS"]) {
      expect(typeof game.preserved()[key]).toBe("function");
    }
    expect(game.preserved().SET.wait).toBe(20);
  });
});