export type QuestionType = "single" | "multi" | "duel" | "text";

export type ThemeId = "sea" | "sakura" | "night" | "sunset";
export type DecorLevel = "calm" | "normal" | "party";
/** "inherit" = reprendre le réglage du site. */
export type PanelTheme = ThemeId | "inherit";
export type PanelDecor = DecorLevel | "inherit";

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
  /** Apparence de la page de cette escale. */
  theme: PanelTheme;
  decor: PanelDecor;
  /** Couleur des boutons (#rrggbb), vide = celle du site. */
  accent: string;
  /** Emoji de la barre de progression, vide = celui du thème. */
  marker: string;
}

/** Tous les petits textes de l'interface publique. */
export interface SiteTexts {
  homeTitle: string;
  homeEmpty: string;
  chipOne: string;
  chipMany: string;
  chipDone: string;
  backLink: string;
  progress: string;
  multiHint: string;
  duelOr: string;
  textPlaceholder: string;
  btnBack: string;
  btnNext: string;
  btnFinish: string;
  btnSending: string;
  noQuestions: string;
  errorGeneric: string;
  errorNetwork: string;
  doneTitle: string;
  doneMessage: string;
  doneButton: string;
}

export interface SiteConfig {
  siteTitle: string;
  greeting: string;
  introMessage: string;
  outroMessage: string;
  /** Emoji de l'accueil, vide = celui du thème. */
  heroEmoji: string;
  theme: ThemeId;
  decor: DecorLevel;
  /** Couleur des boutons (#rrggbb), vide = celle du thème. */
  accent: string;
  texts: SiteTexts;
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
