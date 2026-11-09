export const HEX = /^#[0-9a-fA-F]{6}$/;

/** Assombrit une couleur #rrggbb (pour l'effet « survol » des boutons). */
export function darken(hex: string, amount = 0.16): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.round(v * (1 - amount)));
  const channels = [f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255)];
  return `#${channels.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
