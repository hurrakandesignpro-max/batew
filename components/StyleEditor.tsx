"use client";

import {
  DENSITIES,
  DENSITY_LABELS,
  PARTICLE_LABELS,
  PARTICLES,
  THEME_META,
  THEMES,
  TREE_LABELS,
  TREE_MODES,
} from "@/lib/style";
import type { Density, PageStyle, ParticleKind, TreeMode } from "@/lib/types";

interface Props {
  title: string;
  hint?: string;
  value: PageStyle;
  onChange: (patch: Partial<PageStyle>) => void;
}

/** Réglages d'apparence d'une page : thème, particules, arbres, mascotte, couleur. */
export default function StyleEditor({ title, hint, value, onChange }: Props) {
  const themeMascot = THEME_META[value.theme].mascot;

  return (
    <div className="adm-card">
      <h2>{title}</h2>
      {hint && <p className="muted">{hint}</p>}

      <span className="options-title">Thème</span>
      <div className="theme-grid" role="group" aria-label="Thème">
        {THEMES.map((t) => {
          const meta = THEME_META[t];
          return (
            <button
              key={t}
              type="button"
              className={`theme-card${meta.dark ? " dark" : ""}`}
              style={{ background: meta.preview }}
              aria-pressed={value.theme === t}
              onClick={() => onChange({ theme: t })}
            >
              <span className="theme-emoji" aria-hidden="true">
                {meta.emoji}
              </span>
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      <label className="field">
        <span>Ce qui flotte à l&apos;écran</span>
        <select
          className="in"
          value={value.particles}
          onChange={(e) => onChange({ particles: e.target.value as ParticleKind })}
        >
          {PARTICLES.map((p) => (
            <option key={p} value={p}>
              {PARTICLE_LABELS[p]}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Quantité</span>
        <select
          className="in"
          value={value.density}
          onChange={(e) => onChange({ density: e.target.value as Density })}
        >
          {DENSITIES.map((d) => (
            <option key={d} value={d}>
              {DENSITY_LABELS[d]}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Arbres de sakura</span>
        <select
          className="in"
          value={value.trees}
          onChange={(e) => onChange({ trees: e.target.value as TreeMode })}
        >
          {TREE_MODES.map((m) => (
            <option key={m} value={m}>
              {TREE_LABELS[m]}
            </option>
          ))}
        </select>
      </label>

      <div className="field-row">
        <label className="field emoji-field">
          <span>Mascotte</span>
          <input
            className="in"
            list="emoji-list"
            maxLength={16}
            placeholder={themeMascot}
            value={value.mascot}
            onChange={(e) => onChange({ mascot: e.target.value })}
          />
        </label>
        <div className="field grow">
          <span>Couleur des boutons</span>
          <div className="color-row">
            <input
              type="color"
              className="color-in"
              aria-label="Couleur des boutons et sélections"
              value={value.accent || "#ff7a6b"}
              onChange={(e) => onChange({ accent: e.target.value })}
            />
            {value.accent ? (
              <button
                type="button"
                className="btn secondary small"
                onClick={() => onChange({ accent: "" })}
              >
                Couleur du thème
              </button>
            ) : (
              <small className="muted">Celle du thème</small>
            )}
          </div>
        </div>
      </div>
      <small className="muted">
        Mascotte vide = celle du thème ({themeMascot}). Elle apparaît en haut de
        l&apos;accueil, sur la barre de progression et à la fin d&apos;une escale.
      </small>
    </div>
  );
}
