import type {
  DecorLevel,
  Panel,
  SiteConfig,
  SiteTexts,
  ThemeId,
} from "./types";

/** Textes d'origine. Un champ laissé vide dans l'admin retrouve cette valeur. */
export const DEFAULT_TEXTS: SiteTexts = {
  homeTitle: "Choisis ton escale",
  homeEmpty: "Le capitaine prépare encore les cartes marines… reviens très vite 🧭",
  chipOne: "1 question",
  chipMany: "{n} questions",
  chipDone: "✓ Terminée",
  backLink: "← La carte",
  progress: "Question {i} sur {n}",
  multiHint: "Plusieurs choix possibles.",
  duelOr: "ou",
  textPlaceholder: "Écris ici…",
  btnBack: "← Retour",
  btnNext: "Suivant →",
  btnFinish: "Terminer ⚓",
  btnSending: "Envoi…",
  noQuestions: "Cette escale n'a pas encore de questions.",
  errorGeneric: "Oups, ça n'a pas marché. Réessaie ?",
  errorNetwork: "Oups, la connexion a coulé. Réessaie ?",
  doneTitle: "Escale terminée !",
  doneMessage: "Merci, j'ai bien reçu tes réponses 💙",
  doneButton: "Retour à la carte",
};

/** Description des champs pour l'éditeur de l'admin. */
export const TEXT_FIELDS: {
  key: keyof SiteTexts;
  group: string;
  label: string;
}[] = [
  { key: "homeTitle", group: "Accueil", label: "Titre au-dessus des escales" },
  { key: "homeEmpty", group: "Accueil", label: "Message quand aucune escale n'est visible" },
  { key: "chipOne", group: "Accueil", label: "Pastille d'une escale à 1 question" },
  { key: "chipMany", group: "Accueil", label: "Pastille d'une escale à plusieurs questions ({n} = nombre)" },
  { key: "chipDone", group: "Accueil", label: "Pastille d'une escale terminée" },
  { key: "backLink", group: "Questionnaire", label: "Lien de retour en haut de page" },
  { key: "progress", group: "Questionnaire", label: "Compteur de progression ({i} = numéro, {n} = total)" },
  { key: "multiHint", group: "Questionnaire", label: "Aide des choix multiples (si la question n'a pas son propre texte d'aide)" },
  { key: "duelOr", group: "Questionnaire", label: "Mot entre les deux choix « ceci ou cela »" },
  { key: "textPlaceholder", group: "Questionnaire", label: "Texte dans la zone de réponse libre" },
  { key: "btnBack", group: "Questionnaire", label: "Bouton retour" },
  { key: "btnNext", group: "Questionnaire", label: "Bouton suivant" },
  { key: "btnFinish", group: "Questionnaire", label: "Bouton de la dernière question" },
  { key: "btnSending", group: "Questionnaire", label: "Bouton pendant l'envoi" },
  { key: "noQuestions", group: "Questionnaire", label: "Message d'une escale sans question" },
  { key: "errorGeneric", group: "Questionnaire", label: "Message d'erreur" },
  { key: "errorNetwork", group: "Questionnaire", label: "Message d'erreur de connexion" },
  { key: "doneTitle", group: "Fin d'escale", label: "Titre de l'écran de fin" },
  { key: "doneMessage", group: "Fin d'escale", label: "Message de l'écran de fin" },
  { key: "doneButton", group: "Fin d'escale", label: "Bouton de l'écran de fin" },
];

export const THEMES: Record<
  ThemeId,
  { label: string; emoji: string; description: string }
> = {
  sea: { label: "Mer", emoji: "⛵", description: "vagues et bulles" },
  sakura: { label: "Sakura", emoji: "🌸", description: "cerisiers et pétales qui flottent" },
  night: { label: "Nuit étoilée", emoji: "🌙", description: "étoiles, lune et mer sombre" },
  sunset: { label: "Coucher de soleil", emoji: "🌅", description: "soleil couchant sur les vagues" },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export const DECOR_LABELS: Record<DecorLevel, string> = {
  calm: "Calme",
  normal: "Normal",
  party: "Festif",
};

export const DECOR_IDS = Object.keys(DECOR_LABELS) as DecorLevel[];

/** Remplace {n}, {i}… dans un texte. */
export function fill(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/** Apparence effective d'une page : réglage de l'escale, sinon celui du site. */
export function resolveLook(config: SiteConfig, panel?: Panel) {
  const theme: ThemeId =
    panel && panel.theme !== "inherit" ? panel.theme : config.theme;
  const decor: DecorLevel =
    panel && panel.decor !== "inherit" ? panel.decor : config.decor;
  const accent = (panel && panel.accent) || config.accent;
  return { theme, decor, accent };
}
