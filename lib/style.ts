import type {
  Density,
  PageStyle,
  ParticleKind,
  ThemeId,
  TreeMode,
} from "./types";

export const THEMES: readonly ThemeId[] = ["sea", "sakura", "sunset", "night"];
export const PARTICLES: readonly ParticleKind[] = [
  "auto",
  "bubbles",
  "petals",
  "stars",
  "fireflies",
  "none",
];
export const DENSITIES: readonly Density[] = ["light", "normal", "lots"];
export const TREE_MODES: readonly TreeMode[] = ["none", "left", "right", "both"];

export const THEME_META: Record<
  ThemeId,
  {
    label: string;
    emoji: string;
    mascot: string;
    preview: string;
    dark: boolean;
    particles: Exclude<ParticleKind, "auto" | "none">;
  }
> = {
  sea: {
    label: "Mer",
    emoji: "🌊",
    mascot: "⛵",
    preview: "linear-gradient(180deg, #b9e6f6, #fff6e3)",
    dark: false,
    particles: "bubbles",
  },
  sakura: {
    label: "Sakura",
    emoji: "🌸",
    mascot: "🌸",
    preview: "linear-gradient(180deg, #ffd6e6, #fff9f2)",
    dark: false,
    particles: "petals",
  },
  sunset: {
    label: "Coucher de soleil",
    emoji: "🌅",
    mascot: "🌅",
    preview: "linear-gradient(180deg, #ffc48f, #ffdcc4 70%, #fff0d8)",
    dark: false,
    particles: "fireflies",
  },
  night: {
    label: "Nuit étoilée",
    emoji: "🌙",
    mascot: "🌙",
    preview: "linear-gradient(180deg, #0b1233, #263566)",
    dark: true,
    particles: "stars",
  },
};

export const PARTICLE_LABELS: Record<ParticleKind, string> = {
  auto: "Automatique (selon le thème)",
  bubbles: "Bulles",
  petals: "Pétales de sakura",
  stars: "Étoiles",
  fireflies: "Lucioles",
  none: "Rien",
};

export const DENSITY_LABELS: Record<Density, string> = {
  light: "Léger",
  normal: "Normal",
  lots: "Beaucoup",
};

export const TREE_LABELS: Record<TreeMode, string> = {
  none: "Aucun",
  left: "Un arbre à gauche",
  right: "Un arbre à droite",
  both: "Un arbre de chaque côté",
};

/** Nombre d'éléments [léger, normal, beaucoup] pour chaque type. */
export const PARTICLE_COUNTS: Record<
  Exclude<ParticleKind, "auto" | "none">,
  Record<Density, number>
> = {
  bubbles: { light: 4, normal: 7, lots: 16 },
  petals: { light: 8, normal: 16, lots: 36 },
  stars: { light: 14, normal: 30, lots: 60 },
  fireflies: { light: 6, normal: 12, lots: 26 },
};

export const DEFAULT_STYLE: PageStyle = {
  theme: "sea",
  particles: "auto",
  density: "normal",
  trees: "none",
  mascot: "",
  accent: "",
};

export function mascotOf(style: PageStyle): string {
  return style.mascot || THEME_META[style.theme].mascot;
}

export function particleKindOf(
  style: PageStyle,
): Exclude<ParticleKind, "auto"> {
  return style.particles === "auto"
    ? THEME_META[style.theme].particles
    : style.particles;
}

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

/** Variables CSS qui remplacent la couleur d'accent du thème. */
export function accentVars(hex: string): Record<string, string> | undefined {
  if (!isHexColor(hex)) return undefined;
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const dark = (c: number) => Math.round(c * 0.82);
  return {
    "--coral": hex,
    "--coral-dark": `rgb(${dark(r)}, ${dark(g)}, ${dark(b)})`,
    "--btn-shadow": `rgba(${r}, ${g}, ${b}, 0.6)`,
    "--sel-bg": `rgba(${r}, ${g}, ${b}, 0.14)`,
  };
}
