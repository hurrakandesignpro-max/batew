import { DEFAULT_STYLE } from "./style";
import { DEFAULT_TEXTS } from "./texts";
import type { AppData } from "./types";

/**
 * Complète des données enregistrées avant l'arrivée des textes modifiables
 * et des thèmes : tout ce qui manque reçoit sa valeur par défaut, donc
 * rien à migrer à la main.
 */
export function withDefaults(data: AppData): AppData {
  return {
    config: {
      ...data.config,
      texts: { ...DEFAULT_TEXTS, ...(data.config.texts ?? {}) },
      homeStyle: { ...DEFAULT_STYLE, ...(data.config.homeStyle ?? {}) },
    },
    panels: data.panels.map((p) => ({
      ...p,
      style: { ...DEFAULT_STYLE, ...(p.style ?? {}) },
    })),
  };
}
