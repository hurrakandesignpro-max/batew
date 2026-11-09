"use client";

import { useMemo, useState } from "react";
import type { SiteTexts, ThemeId } from "@/lib/types";

/** Confettis (selon le thème) + surprise cachée. Tous les textes viennent de `texts`. */
const THEME_FX: Record<
  ThemeId,
  { pieces: string[]; motion: "fall" | "rise"; egg: "swim" | "sun" | "petals" | "shoot" }
> = {
  sea: { pieces: ["🫧", "🐚", "🐠", "🫧", "⚓"], motion: "rise", egg: "swim" },
  sakura: { pieces: ["🌸", "🌸", "🌷", "🌸"], motion: "fall", egg: "petals" },
  sunset: { pieces: ["✨", "🧡", "✨", "🌇"], motion: "rise", egg: "sun" },
  night: { pieces: ["⭐", "✨", "🌙", "⭐"], motion: "fall", egg: "shoot" },
};

const EGG_KEYS = {
  sea: ["eggSeaEmoji", "eggSeaHint", "eggSeaMessage"],
  sakura: ["eggSakuraEmoji", "eggSakuraHint", "eggSakuraMessage"],
  sunset: ["eggSunsetEmoji", "eggSunsetHint", "eggSunsetMessage"],
  night: ["eggNightEmoji", "eggNightHint", "eggNightMessage"],
} as const satisfies Record<ThemeId, readonly (keyof SiteTexts)[]>;

interface Piece {
  id: number;
  char: string;
  left: number;
  delay: number;
  dur: number;
  size: number;
  drift: number;
}

function makePieces(chars: string[], count: number): Piece[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    char: chars[id % chars.length],
    left: Math.round(Math.random() * 100),
    delay: Math.round(Math.random() * 900) / 1000,
    dur: 2200 + Math.round(Math.random() * 1800),
    size: 16 + Math.round(Math.random() * 16),
    drift: Math.round(Math.random() * 80 - 40),
  }));
}

function Burst({ pieces, motion }: { pieces: Piece[]; motion: "fall" | "rise" }) {
  return (
    <div className={`fx-burst ${motion}`} aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}ms`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}

interface Props {
  theme: ThemeId;
  mascot: string;
  texts: SiteTexts;
  preview: boolean;
  title: string;
  message: string;
}

export default function Finale({ theme, mascot, texts, preview, title, message }: Props) {
  const fx = THEME_FX[theme];
  const [emojiKey, hintKey, msgKey] = EGG_KEYS[theme];
  const [found, setFound] = useState(0); // nombre de fois où la surprise a été déclenchée

  const intro = useMemo(() => makePieces(fx.pieces, 22), [fx]);
  const extra = useMemo(
    () => (found > 0 ? makePieces(fx.pieces, 28) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [found, fx],
  );

  const eggEmoji = texts[emojiKey];
  const eggHint = texts[hintKey];
  const eggMessage = texts[msgKey];

  return (
    <div className={`finale theme-${theme}`}>
      <Burst pieces={intro} motion={fx.motion} />

      <div className="big finale-mascot" aria-hidden="true">
        {mascot}
      </div>
      {!preview && texts.doneConfirm && (
        <p className="confirm-pill">{texts.doneConfirm}</p>
      )}
      <h2>{title}</h2>
      {message && <p className="muted">{message}</p>}

      <div className="egg-zone">
        <button
          type="button"
          className="egg"
          aria-label={eggHint || eggEmoji}
          onClick={() => setFound((n) => n + 1)}
        >
          {eggEmoji}
        </button>
        {eggHint && found === 0 && <small className="egg-hint">{eggHint}</small>}
      </div>

      {found > 0 && (
        <>
          <Burst key={found} pieces={extra} motion={fx.motion} />
          <span key={`fly-${found}`} className={`egg-fly ${fx.egg}`} aria-hidden="true">
            {eggEmoji}
          </span>
          <p key={`msg-${found}`} className="bubble egg-message" role="status">
            {eggMessage}
          </p>
        </>
      )}
    </div>
  );
}
