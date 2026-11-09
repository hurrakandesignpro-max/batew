import type { SiteTexts } from "./texts";

export type { SiteTexts };

export type QuestionType = "single" | "multi" | "duel" | "text";

/** Thème = palette + fond + sol (vagues ou collines). */
export type ThemeId = "sea" | "sakura" | "sunset" | "night";
/** Ce qui flotte à l'écran. "auto" = celui du thème. */
export type ParticleKind =
  | "auto"
  | "bubbles"
  | "petals"
  | "stars"
  | "fireflies"
  | "none";
export type Density = "light" | "normal" | "lots";
export type TreeMode = "none" | "left" | "right" | "both";

/** Apparence d'une page (l'accueil, ou une escale). */
export interface PageStyle {
  theme: ThemeId;
  particles: ParticleKind;
  density: Density;
  /** Arbres de sakura sur le côté de la page. */
  trees: TreeMode;
  /** Emoji mascotte (haut de l'accueil, barre de progression, fin d'escale). Vide = celui du thème. */
  mascot: string;
  /** Couleur des boutons et sélections, au format #rrggbb. Vide = celle du thème. */
  accent: string;
}

export interface Option {
  id: string;
  label: string;
  emoji?: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  /** Vide pour le type "text". Exactement 2 pour "duel". */
  options: Option[];
  /** Petit texte d'aide affiché sous la question. */
  hint?: string;
}

export interface Panel {
  id: string;
  title: string;
  emoji: string;
  description: string;
  /** Un panel non publié reste un brouillon invisible sur le site. */
  published: boolean;
  questions: Question[];
  /** Apparence propre à cette escale. */
  style: PageStyle;
  /** Petit mot affiché au-dessus de la première question. */
  intro?: string;
  /** Titre / message de fin propres à cette escale (sinon ceux des Textes). */
  doneTitle?: string;
  doneMessage?: string;
}

export interface SiteConfig {
  siteTitle: string;
  greeting: string;
  introMessage: string;
  outroMessage: string;
  /** Tous les autres petits textes du site. */
  texts: SiteTexts;
  /** Apparence de l'accueil (et de la page 404). */
  homeStyle: PageStyle;
}

export interface AppData {
  config: SiteConfig;
  panels: Panel[];
}

/** Choix : liste d'ids d'options. Texte libre : chaîne. */
export type AnswerValue = string[] | string;

export interface StoredAnswer {
  value: AnswerValue;
  at: string;
}

/** Réponses indexées par id de question. */
export type AnswersMap = Record<string, StoredAnswer>;
