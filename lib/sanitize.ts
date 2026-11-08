import { seedData } from "./seed";
import {
  DEFAULT_STYLE,
  DENSITIES,
  isHexColor,
  PARTICLES,
  THEMES,
  TREE_MODES,
} from "./style";
import { DEFAULT_TEXTS, TEXT_FIELDS, type TextKey } from "./texts";
import type {
  AppData,
  Option,
  PageStyle,
  Panel,
  Question,
  QuestionType,
  SiteConfig,
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

const fail = (error: string): SanitizeResult => ({ ok: false, error });

function pick<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function cleanStyle(raw: unknown): PageStyle {
  const s = (raw ?? {}) as Record<string, unknown>;
  return {
    theme: pick(s.theme, THEMES, DEFAULT_STYLE.theme),
    particles: pick(s.particles, PARTICLES, DEFAULT_STYLE.particles),
    density: pick(s.density, DENSITIES, DEFAULT_STYLE.density),
    trees: pick(s.trees, TREE_MODES, DEFAULT_STYLE.trees),
    mascot: cleanStr(s.mascot, 16),
    accent: isHexColor(s.accent) ? s.accent.toLowerCase() : "",
  };
}

function cleanTexts(raw: unknown): SiteConfig["texts"] {
  const t = (raw ?? {}) as Record<string, unknown>;
  const texts = { ...DEFAULT_TEXTS };
  for (const f of TEXT_FIELDS) {
    const value = t[f.key];
    if (typeof value !== "string") continue;
    const clean = value.trim().slice(0, f.max);
    // Vide = texte par défaut, sauf pour les textes qu'on peut masquer.
    texts[f.key as TextKey] = clean || (f.optional ? "" : f.def);
  }
  return texts;
}

/**
 * Nettoie et valide les données envoyées par l'admin.
 * Les brouillons sont nettoyés mais tolérés incomplets ;
 * les escales publiées doivent être complètes.
 */
export function sanitizeData(input: unknown): SanitizeResult {
  if (!input || typeof input !== "object") return fail("Données invalides.");
  const raw = input as { config?: unknown; panels?: unknown };

  const c = (raw.config ?? {}) as Record<string, unknown>;
  const config: SiteConfig = {
    siteTitle: cleanStr(c.siteTitle, 60) || seedData.config.siteTitle,
    greeting: cleanStr(c.greeting, 80) || seedData.config.greeting,
    introMessage: cleanStr(c.introMessage, 600),
    outroMessage: cleanStr(c.outroMessage, 600),
    texts: cleanTexts(c.texts),
    homeStyle: cleanStyle(c.homeStyle),
  };

  if (!Array.isArray(raw.panels)) return fail("Liste d'escales invalide.");
  if (raw.panels.length > LIMITS.panels) {
    return fail(`Maximum ${LIMITS.panels} escales.`);
  }

  // Les ids de panels ET de questions doivent être uniques (les réponses
  // sont rangées par id de question).
  const used = new Set<string>();
  const panels: Panel[] = [];

  for (const rawPanel of raw.panels) {
    const p = (rawPanel ?? {}) as Record<string, unknown>;
    const panel: Panel = {
      id: cleanId(p.id, used),
      title: cleanStr(p.title, 60),
      emoji: cleanStr(p.emoji, 16) || "🐚",
      description: cleanStr(p.description, 200),
      published: p.published === true,
      questions: [],
      style: cleanStyle(p.style),
    };
    const intro = cleanStr(p.intro, 300);
    if (intro) panel.intro = intro;
    const doneTitle = cleanStr(p.doneTitle, 80);
    if (doneTitle) panel.doneTitle = doneTitle;
    const doneMessage = cleanStr(p.doneMessage, 300);
    if (doneMessage) panel.doneMessage = doneMessage;

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

  for (const panel of panels) {
    if (!panel.published) continue;
    const name = panel.title || "(sans titre)";
    if (!panel.title) return fail("Une escale visible n'a pas de titre.");
    if (panel.questions.length === 0) {
      return fail(`L'escale « ${name} » est visible mais n'a aucune question.`);
    }
    for (const q of panel.questions) {
      if (!q.text) {
        return fail(`Une question de l'escale « ${name} » n'a pas de texte.`);
      }
      if (q.type === "duel" && q.options.length !== 2) {
        return fail(
          `La question « ${q.text} » (ceci ou cela) doit avoir exactement 2 choix remplis.`,
        );
      }
      if ((q.type === "single" || q.type === "multi") && q.options.length < 2) {
        return fail(
          `La question « ${q.text} » doit avoir au moins 2 choix remplis.`,
        );
      }
    }
  }

  return { ok: true, data: { config, panels } };
}
