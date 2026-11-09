import type { CSSProperties } from "react";
import { rng } from "@/lib/rng";
import type { DecorLevel, ThemeId } from "@/lib/types";
import Waves from "./Waves";

/** Choisit une quantité selon l'intensité : [calme, normal, festif]. */
function amount(level: DecorLevel, values: [number, number, number]): number {
  return level === "calm" ? values[0] : level === "party" ? values[2] : values[1];
}

function Petals({ count }: { count: number }) {
  const r = rng(7);
  const items = Array.from({ length: count }, () => ({
    x: `${(r() * 100).toFixed(1)}%`,
    s: `${(10 + r() * 12).toFixed(1)}px`,
    d: `${(9 + r() * 9).toFixed(1)}s`,
    delay: `-${(r() * 18).toFixed(1)}s`,
    drift: `${Math.round((r() - 0.5) * 220)}px`,
    rot: `${Math.round(240 + r() * 480)}deg`,
    variant: r() < 0.5 ? "a" : "b",
  }));
  return (
    <div className="petals" aria-hidden="true">
      {items.map((p, i) => (
        <span
          key={i}
          className={`petal ${p.variant}`}
          style={
            {
              "--x": p.x,
              "--s": p.s,
              "--d": p.d,
              "--delay": p.delay,
              "--drift": p.drift,
              "--rot": p.rot,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Centres et rayons des touffes de fleurs, couleurs de rose variées. */
const BLOSSOMS: [number, number, number, string][] = [
  [64, 150, 40, "#f9bcd2"],
  [112, 98, 44, "#f7a8c4"],
  [168, 124, 46, "#fbd0df"],
  [216, 102, 40, "#f9bcd2"],
  [246, 152, 36, "#f7a8c4"],
  [188, 178, 40, "#f493b5"],
  [128, 168, 42, "#fbd0df"],
  [232, 226, 36, "#f9bcd2"],
  [96, 212, 32, "#f7a8c4"],
  [150, 66, 32, "#fbd0df"],
  [58, 108, 28, "#f9bcd2"],
  [272, 118, 26, "#f7a8c4"],
];

function SakuraTree({ side }: { side: "left" | "right" }) {
  return (
    <div className={`tree ${side}`} aria-hidden="true">
      <svg viewBox="0 0 300 380">
        <g stroke="#7a5252" strokeLinecap="round" fill="none">
          <path d="M148 380 C150 320 140 270 116 226 C104 204 90 184 66 160" strokeWidth="18" />
          <path d="M122 232 C146 204 176 190 214 182" strokeWidth="11" />
          <path d="M136 280 C164 262 196 256 232 232" strokeWidth="9" />
          <path d="M92 188 C84 160 92 132 114 108" strokeWidth="8" />
          <path d="M214 182 C234 164 248 142 246 114" strokeWidth="6" />
        </g>
        <g opacity="0.94">
          {BLOSSOMS.map(([cx, cy, rad, color], i) => (
            <circle key={i} cx={cx} cy={cy} r={rad} fill={color} />
          ))}
        </g>
        <g opacity="0.7" fill="#ffeef4">
          {BLOSSOMS.map(([cx, cy, rad], i) => (
            <circle key={i} cx={cx - rad * 0.2} cy={cy - rad * 0.25} r={rad * 0.45} />
          ))}
        </g>
      </svg>
    </div>
  );
}

function Stars({ count }: { count: number }) {
  const r = rng(23);
  const items = Array.from({ length: count }, () => ({
    x: `${(r() * 100).toFixed(1)}%`,
    y: `${(r() * 70).toFixed(1)}%`,
    s: `${(1 + r() * 2.4).toFixed(1)}px`,
    d: `${(2 + r() * 4).toFixed(1)}s`,
    delay: `-${(r() * 6).toFixed(1)}s`,
  }));
  return (
    <div className="stars" aria-hidden="true">
      {items.map((s, i) => (
        <span
          key={i}
          className="star"
          style={
            {
              "--x": s.x,
              "--y": s.y,
              "--s": s.s,
              "--d": s.d,
              "--delay": s.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default function Decor({
  theme,
  decor,
}: {
  theme: ThemeId;
  decor: DecorLevel;
}) {
  switch (theme) {
    case "sakura":
      return (
        <>
          <div className="hill" aria-hidden="true" />
          <SakuraTree side="left" />
          <SakuraTree side="right" />
          <Petals count={amount(decor, [8, 18, 36])} />
        </>
      );
    case "night":
      return (
        <>
          <Stars count={amount(decor, [25, 55, 100])} />
          <div className="moon" aria-hidden="true" />
          <Waves bubbles={0} />
        </>
      );
    case "sunset":
      return (
        <>
          <div className="sun" aria-hidden="true" />
          <Waves bubbles={amount(decor, [0, 3, 8])} />
        </>
      );
    default:
      return <Waves bubbles={amount(decor, [3, 6, 14])} />;
  }
}
