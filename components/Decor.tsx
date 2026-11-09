import type { CSSProperties } from "react";
import {
  PARTICLE_COUNTS,
  particleKindOf,
} from "@/lib/style";
import type { Density, PageStyle, TreeMode } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Petit générateur pseudo-aléatoire : mêmes positions à chaque affichage.    */
/* -------------------------------------------------------------------------- */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f1 = (n: number) => n.toFixed(1);

/* -------------------------------------------------------------------------- */
/* Particules : bulles, pétales, étoiles, lucioles                            */
/* -------------------------------------------------------------------------- */

type ParticleType = "bubbles" | "petals" | "stars" | "fireflies";

function Particles({ kind, density }: { kind: ParticleType; density: Density }) {
  const count = PARTICLE_COUNTS[kind][density];
  const rand = rng(kind.charCodeAt(0) * 131 + kind.length);
  const between = (a: number, b: number) => a + rand() * (b - a);

  const items = Array.from({ length: count }, (): Record<string, string> => {
    switch (kind) {
      case "bubbles":
        return {
          "--x": `${f1(between(4, 94))}%`,
          "--s": `${Math.round(between(8, 18))}px`,
          "--d": `${f1(between(10, 16))}s`,
          "--delay": `${f1(between(0, 8))}s`,
        };
      case "petals": {
        const d = between(9, 17);
        return {
          "--x": `${f1(between(0, 100))}%`,
          "--y": `${f1(between(0, 92))}%`,
          "--s": `${Math.round(between(9, 17))}px`,
          "--d": `${f1(d)}s`,
          "--delay": `-${f1(between(0, d))}s`,
          "--dx": `${Math.round(between(-60, 140))}px`,
          "--f": `${f1(between(2.4, 5))}s`,
        };
      }
      case "stars": {
        const big = rand() < 0.12;
        return {
          "--x": `${f1(between(0, 100))}%`,
          "--y": `${f1(between(0, 72))}%`,
          "--s": `${f1(big ? 5.5 : between(2, 4.2))}px`,
          "--d": `${f1(between(2.5, 6))}s`,
          "--delay": `-${f1(between(0, 6))}s`,
        };
      }
      case "fireflies": {
        const d = between(9, 17);
        return {
          "--x": `${f1(between(3, 97))}%`,
          "--y": `${f1(between(35, 92))}%`,
          "--s": `${f1(between(4, 7))}px`,
          "--d": `${f1(d)}s`,
          "--delay": `-${f1(between(0, d))}s`,
          "--dx": `${Math.round(between(-50, 50))}px`,
        };
      }
    }
  });

  return (
    <div className={`particles ${kind}`} aria-hidden="true">
      {items.map((vars, i) => (
        <span key={i} style={vars as CSSProperties}>
          {kind === "petals" && <i />}
        </span>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sol : vagues (mer, coucher de soleil, nuit) ou collines (sakura)           */
/* -------------------------------------------------------------------------- */

const WAVE = "M0,60 C200,0 400,120 600,60 C800,0 1000,120 1200,60 L1200,120 L0,120 Z";

function WaveLayer({ className }: { className: string }) {
  // Deux copies côte à côte : l'animation décale de 50 % puis recommence,
  // ce qui donne une vague sans coupure.
  return (
    <div className={`wave ${className}`}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d={WAVE} />
      </svg>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d={WAVE} />
      </svg>
    </div>
  );
}

function Waves() {
  return (
    <div className="waves" aria-hidden="true">
      <WaveLayer className="wave-back" />
      <WaveLayer className="wave-mid" />
      <WaveLayer className="wave-front" />
    </div>
  );
}

function Hills() {
  return (
    <div className="waves hills" aria-hidden="true">
      <svg className="hill hill-1" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,66 C150,26 320,38 480,62 C650,90 800,28 980,36 C1080,40 1150,56 1200,64 L1200,120 L0,120 Z" />
      </svg>
      <svg className="hill hill-2" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,88 C180,50 360,60 540,84 C720,108 900,54 1200,86 L1200,120 L0,120 Z" />
      </svg>
      <svg className="hill hill-3" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,104 C250,76 450,96 650,100 C850,104 1000,78 1200,100 L1200,120 L0,120 Z" />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Arbres de sakura                                                           */
/* -------------------------------------------------------------------------- */

const BLOSSOMS = ["#ffd6e5", "#ffc2d8", "#ffadc9", "#ff97ba", "#ffe8f0"];

// Branches : du tronc vers l'extrémité (la dernière coordonnée de chaque tracé).
const BRANCHES: { d: string; w: number; tip: [number, number] }[] = [
  { d: "M153,254 C146,215 122,190 78,172", w: 8, tip: [78, 172] },
  { d: "M154,242 C150,190 130,150 100,118", w: 7, tip: [100, 118] },
  { d: "M156,238 C158,180 150,130 142,82", w: 7, tip: [142, 82] },
  { d: "M164,240 C176,190 186,120 192,62", w: 7, tip: [192, 62] },
  { d: "M164,242 C196,200 226,150 238,98", w: 7, tip: [238, 98] },
  { d: "M168,250 C210,218 245,196 264,162", w: 8, tip: [264, 162] },
];

function Tree({ seed }: { seed: number }) {
  const rand = rng(seed);
  const between = (a: number, b: number) => a + rand() * (b - a);
  const blobs: { x: number; y: number; r: number; c: string; o: number }[] = [];

  const add = (cx: number, cy: number, spread: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand()) * spread;
      blobs.push({
        x: cx + Math.cos(angle) * dist,
        y: Math.min(225, cy + Math.sin(angle) * dist * 0.85),
        r: between(10, 22),
        c: BLOSSOMS[Math.floor(rand() * BLOSSOMS.length)],
        o: between(0.82, 0.97),
      });
    }
  };

  add(150, 125, 95, 30); // le gros de la couronne
  for (const b of BRANCHES) add(b.tip[0], b.tip[1], 38, 12); // les bouts de branches

  return (
    <svg viewBox="0 0 320 400" role="presentation" focusable="false">
      <path
        d="M133,400 C140,350 147,305 148,268 C149,250 154,240 158,232 C162,240 169,250 170,268 C171,305 178,350 191,400 Z"
        fill="#6b4a3a"
      />
      <g fill="none" stroke="#6b4a3a" strokeLinecap="round">
        {BRANCHES.map((b, i) => (
          <path key={i} d={b.d} strokeWidth={b.w} />
        ))}
      </g>
      <g>
        {blobs.map((b, i) => (
          <circle
            key={i}
            cx={f1(b.x)}
            cy={f1(b.y)}
            r={f1(b.r)}
            fill={b.c}
            opacity={b.o.toFixed(2)}
          />
        ))}
      </g>
    </svg>
  );
}

function Trees({ mode }: { mode: TreeMode }) {
  if (mode === "none") return null;
  return (
    <>
      {(mode === "left" || mode === "both") && (
        <div className="tree tree-left" aria-hidden="true">
          <Tree seed={7} />
        </div>
      )}
      {(mode === "right" || mode === "both") && (
        <div className="tree tree-right" aria-hidden="true">
          <Tree seed={21} />
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */

export default function Decor({ style }: { style: PageStyle }) {
  const kind = particleKindOf(style);
  return (
    <>
      {style.theme === "sakura" ? <Hills /> : <Waves />}
      <Trees mode={style.trees} />
      {kind !== "none" && <Particles kind={kind} density={style.density} />}
    </>
  );
}
