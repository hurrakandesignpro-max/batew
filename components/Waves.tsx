import type { CSSProperties } from "react";
import { rng } from "@/lib/rng";

const PATH = "M0,60 C200,0 400,120 600,60 C800,0 1000,120 1200,60 L1200,120 L0,120 Z";

function Layer({ className }: { className: string }) {
  // Deux copies côte à côte : l'animation décale de 50 % puis recommence,
  // ce qui donne une vague sans coupure. La couleur vient du thème (CSS).
  return (
    <div className={`wave ${className}`}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d={PATH} fill="currentColor" />
      </svg>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d={PATH} fill="currentColor" />
      </svg>
    </div>
  );
}

export default function Waves({ bubbles = 6 }: { bubbles?: number }) {
  const r = rng(11);
  const items = Array.from({ length: bubbles }, () => ({
    x: `${Math.round(r() * 96)}%`,
    s: `${Math.round(8 + r() * 12)}px`,
    d: `${Math.round(10 + r() * 8)}s`,
    delay: `-${Math.round(r() * 16)}s`,
  }));

  return (
    <>
      {items.length > 0 && (
        <div className="bubbles" aria-hidden="true">
          {items.map((b, i) => (
            <span
              key={i}
              style={
                {
                  "--x": b.x,
                  "--s": b.s,
                  "--d": b.d,
                  "--delay": b.delay,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
      <div className="waves" aria-hidden="true">
        <Layer className="wave-back" />
        <Layer className="wave-mid" />
        <Layer className="wave-front" />
      </div>
    </>
  );
}
