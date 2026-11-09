import { HEX } from "./color";
import { DECOR_IDS, DEFAULT_TEXTS, THEME_IDS } from "./defaults";
import { seedData } from "./seed";
import type {
  AppData,
  DecorLevel,
  Option,
  Panel,
  PanelDecor,
  PanelTheme,
  Question,
  QuestionType,
  SiteConfig,
  SiteTexts,
  ThemeId,
} from "./types";

const TYPES: QuestionType[] = ["single", "multi", "duel", "text"];
const LIMITS = { panels: 30, questions: 40, options: 12 };

export type SanitizeResult =
  | { ok: true; data: AppData }
  | { ok: false; error: string };

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function cleanId(value: unknown, used: Set<string>): string {
  let id =
    typeof value === "string"
      ? value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40)
      : "";
  if (!id || used.has(id)) {
    do {
      id = randomId();
    } while (used.has(id));
  }
  used.add(id);
  return id;
}

function cleanStr(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanAccent(value: unknown): string {
  const s = typeof value === "string" ? value.trim() : "";
  return HEX.test(s) ? s.toLowerCase() : "";
}

function cleanTheme(value: unknown): ThemeId {
  return THEME_IDS.includes(value as ThemeId) ? (value as ThemeId) : "sea";
}

function cleanDecor(value: unknown): DecorLevel {
  return DECOR_IDS.includes(value as DecorLevel)
    ? (value as DecorLevel)
    : "normal";
}

function cleanConfig(raw: unknown): SiteConfig {
  const c = (raw ?? {}) as Record<string, unknown>;
  const t = (c.texts ?? {}) as Record<string, unknown>;

  // Chaque texte vide retrouve sa valeur d'origine.
  const texts: SiteTexts = { ...DEFAULT_TEXTS };
  for (const key of Object.keys(DEFAULT_TEXTS) as (keyof SiteTexts)[]) {
    texts[key] = cleanStr(t[key], 200) || DEFAULT_TEXTS[key];
  }

  return {
    siteTitle: cleanStr(c.siteTitle, 60) || seedData.config.siteTitle,
    greeting: cleanStr(c.greeting, 80) || seedData.config.greeting,
    introMessage: cleanStr(c.introMessage, 600),
    outroMessage: cleanStr(c.outroMessage, 600),
    heroEmoji: cleanStr(c.heroEmoji, 16),
    theme: cleanTheme(c.theme),
    decor: cleanDecor(c.decor),
    accent: cleanAccent(c.accent),
    texts,
  };
}

function cleanPanels(rawPanels: unknown[]): Panel[] {
  // Les ids de panels ET de questions doivent être uniques (les réponses
  // sont rangées par id de question).
  const used = new Set<string>();
  const panels: Panel[] = [];

  for (const rawPanel of rawPanels) {
    const p = (rawPanel ?? {}) as Record<string, unknown>;
    const panel: Panel = {
      id: cleanId(p.id, used),
      title: cleanStr(p.title, 60),
      emoji: cleanStr(p.emoji, 16) || "🐚",
      description: cleanStr(p.description, 200),
      published: p.published === true,
      theme:
        p.theme === "inherit" || THEME_IDS.includes(p.theme as ThemeId)
          ? (p.theme as PanelTheme)
          : "inherit",
      decor:
        p.decor === "inherit" || DECOR_IDS.includes(p.decor as DecorLevel)
          ? (p.decor as PanelDecor)
          : "inherit",
      accent: cleanAccent(p.accent),
      marker: cleanStr(p.marker, 16),
      questions: [],
    };

    const rawQuestions = Array.isArray(p.questions)
      ? p.questions.slice(0, LIMITS.questions)
      : [];

    for (const rawQuestion of rawQuestions) {
      const q = (rawQuestion ?? {}) as Record<string, unknown>;
      const type: QuestionType = TYPES.includes(q.type as QuestionType)
        ? (q.type as QuestionType)
        : "single";

      const optionIds = new Set<string>();
      let options: Option[] = [];
      if (type !== "text" && Array.isArray(q.options)) {
        options = q.options
          .slice(0, LIMITS.options)
          .map((rawOption): Option => {
            const o = (rawOption ?? {}) as Record<string, unknown>;
            return {
              id: cleanId(o.id, optionIds),
              label: cleanStr(o.label, 80),
              emoji: cleanStr(o.emoji, 16) || undefined,
            };
          })
          .filter((o) => o.label.length > 0);
      }
      if (type === "duel") options = options.slice(0, 2);

      const question: Question = {
        id: cleanId(q.id, used),
        text: cleanStr(q.text, 200),
        type,
        options,
      };
      const hint = cleanStr(q.hint, 150);
      if (hint) question.hint = hint;
      panel.questions.push(question);
    }

    panels.push(panel);
  }

  return panels;
}

function cleanAll(input: unknown): AppData | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as { config?: unknown; panels?: unknown };
  if (!Array.isArray(raw.panels)) return null;
  return {
    config: cleanConfig(raw.config),
    panels: cleanPanels(raw.panels.slice(0, LIMITS.panels)),
  };
}

/**
 * Complète des données déjà enregistrées avec les champs ajoutés depuis
 * (thèmes, textes…), sans rien refuser. Utilisé à la lecture.
 */
export function normalizeData(input: unknown): AppData {
  return cleanAll(input) ?? (JSON.parse(JSON.stringify(seedData)) as AppData);
}

function validatePublished(panels: Panel[]): string | null {
  for (const panel of panels) {
    if (!panel.published) continue;
    const name = panel.title || "(sans titre)";
    if (!panel.title) return "Une escale visible n'a pas de titre.";
    if (panel.questions.length === 0) {
      return `L'escale « ${name} » est visible mais n'a aucune question.`;
    }
    for (const q of panel.questions) {
      if (!q.text) {
        return `Une question de l'escale « ${name} » n'a pas de texte.`;
      }
      if (q.type === "duel" && q.options.length !== 2) {
        return `La question « ${q.text} » (ceci ou cela) doit avoir exactement 2 choix remplis.`;
      }
      if ((q.type === "single" || q.type === "multi") && q.options.length < 2) {
        return `La question « ${q.text} » doit avoir au moins 2 choix remplis.`;
      }
    }
  }
  return null;
}

/**
 * Nettoie et valide les données envoyées par l'admin.
 * Les brouillons sont nettoyés mais tolérés incomplets ;
 * les escales publiées doivent être complètes.
 */
export function sanitizeData(input: unknown): SanitizeResult {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Données invalides." };
  }
  const raw = input as { panels?: unknown };
  if (!Array.isArray(raw.panels)) {
    return { ok: false, error: "Liste d'escales invalide." };
  }
  if (raw.panels.length > LIMITS.panels) {
    return { ok: false, error: `Maximum ${LIMITS.panels} escales.` };
  }

  const data = cleanAll(input);
  if (!data) return { ok: false, error: "Données invalides." };

  const error = validatePublished(data.panels);
  return error ? { ok: false, error } : { ok: true, data };
}
