/**
 * Tous les petits textes du site (hors titre / salutation / messages d'accueil
 * et de fin, qui sont dans `config`). Chacun est modifiable dans
 * Admin → Textes. `def` = texte par défaut.
 *
 * Dans certains textes, des marqueurs entre accolades sont remplacés :
 *   {n}  → nombre de questions   {current} / {total} → numéro de question
 */

export type TextGroup = "home" | "quiz" | "done" | "notfound" | "share";

export interface TextField {
  key: string;
  group: TextGroup;
  label: string;
  def: string;
  max: number;
  multiline?: boolean;
  /** Si vrai, on a le droit de laisser vide (= le texte est masqué). */
  optional?: boolean;
  hint?: string;
}

const FIELDS = [
  // ------------------------------- Accueil -------------------------------
  {
    key: "mapTitle",
    group: "home",
    label: "Titre au-dessus des escales",
    def: "Choisis ton escale",
    max: 60,
    optional: true,
    hint: "Laisse vide pour masquer ce titre.",
  },
  {
    key: "emptyMessage",
    group: "home",
    label: "Message quand aucune escale n'est visible",
    def: "Le capitaine prépare encore les cartes marines… reviens très vite 🧭",
    max: 200,
    multiline: true,
  },
  {
    key: "chipDone",
    group: "home",
    label: "Pastille d'une escale terminée",
    def: "✓ Terminée",
    max: 30,
  },
  {
    key: "chipOne",
    group: "home",
    label: "Pastille quand il y a 1 question",
    def: "{n} question",
    max: 30,
    hint: "{n} sera remplacé par le nombre de questions.",
  },
  {
    key: "chipMany",
    group: "home",
    label: "Pastille quand il y a plusieurs questions",
    def: "{n} questions",
    max: 30,
    hint: "{n} sera remplacé par le nombre de questions.",
  },
  {
    key: "footerSymbol",
    group: "home",
    label: "Petit symbole en bas de page (lien discret vers l'admin)",
    def: "⚓",
    max: 16,
  },

  // ---------------------------- Questionnaire ----------------------------
  {
    key: "backLink",
    group: "quiz",
    label: "Lien de retour en haut de page",
    def: "← La carte",
    max: 40,
  },
  {
    key: "previewNote",
    group: "quiz",
    label: "Bandeau d'aperçu d'un brouillon (visible par toi seulement)",
    def: "🔍 Aperçu du brouillon : rien n'est enregistré.",
    max: 120,
  },
  {
    key: "counter",
    group: "quiz",
    label: "Compteur de questions",
    def: "Question {current} sur {total}",
    max: 60,
    hint: "{current} = numéro de la question, {total} = nombre de questions.",
  },
  {
    key: "multiHint",
    group: "quiz",
    label: "Aide des questions à choix multiples",
    def: "Plusieurs choix possibles.",
    max: 80,
    optional: true,
    hint: "Affichée seulement si la question n'a pas son propre texte d'aide.",
  },
  {
    key: "textPlaceholder",
    group: "quiz",
    label: "Texte grisé des réponses libres",
    def: "Écris ici…",
    max: 60,
  },
  {
    key: "duelWord",
    group: "quiz",
    label: "Mot entre les deux choix des « ceci ou cela »",
    def: "ou",
    max: 12,
  },
  {
    key: "prevButton",
    group: "quiz",
    label: "Bouton « précédent »",
    def: "← Retour",
    max: 30,
  },
  {
    key: "nextButton",
    group: "quiz",
    label: "Bouton « suivant »",
    def: "Suivant →",
    max: 30,
  },
  {
    key: "finishButton",
    group: "quiz",
    label: "Bouton de la dernière question",
    def: "Terminer ⚓",
    max: 30,
  },
  {
    key: "savingButton",
    group: "quiz",
    label: "Bouton pendant l'envoi des réponses",
    def: "Envoi…",
    max: 30,
  },
  {
    key: "noQuestions",
    group: "quiz",
    label: "Message d'une escale sans question",
    def: "Cette escale n'a pas encore de questions.",
    max: 120,
  },
  {
    key: "errorGeneric",
    group: "quiz",
    label: "Message d'erreur général",
    def: "Oups, ça n'a pas marché. Réessaie ?",
    max: 120,
  },
  {
    key: "errorNetwork",
    group: "quiz",
    label: "Message d'erreur de connexion",
    def: "Oups, la connexion a coulé. Réessaie ?",
    max: 120,
  },

  // ----------------------------- Fin d'escale -----------------------------
  {
    key: "doneTitle",
    group: "done",
    label: "Titre quand une escale est terminée",
    def: "Escale terminée !",
    max: 80,
  },
  {
    key: "doneMessage",
    group: "done",
    label: "Message quand une escale est terminée",
    def: "Merci, j'ai bien reçu tes réponses 💙",
    max: 300,
    multiline: true,
    optional: true,
    hint: "Chaque escale peut avoir son propre message (dans l'éditeur de l'escale).",
  },
  {
    key: "donePreview",
    group: "done",
    label: "Message de fin d'un aperçu de brouillon",
    def: "Fin de l'aperçu : rien n'a été enregistré.",
    max: 120,
  },
  {
    key: "doneButton",
    group: "done",
    label: "Bouton de fin d'escale",
    def: "Retour à la carte",
    max: 40,
  },

  // ----------------------------- Page introuvable -----------------------------
  {
    key: "notFoundTitle",
    group: "notfound",
    label: "Titre",
    def: "Cette mer n'existe pas",
    max: 80,
  },
  {
    key: "notFoundMessage",
    group: "notfound",
    label: "Message",
    def: "On a dû se tromper de cap… Reviens à la carte, on repart de zéro 🧭",
    max: 200,
    multiline: true,
  },
  {
    key: "notFoundButton",
    group: "notfound",
    label: "Bouton",
    def: "Retour à la carte",
    max: 40,
  },

  // -------------------------------- Partage --------------------------------
  {
    key: "metaDescription",
    group: "share",
    label: "Description du lien (aperçu dans WhatsApp, Messenger…)",
    def: "Une petite escale rien que pour nous deux.",
    max: 160,
    multiline: true,
  },
] as const satisfies readonly TextField[];

export type TextKey = (typeof FIELDS)[number]["key"];
export type SiteTexts = Record<TextKey, string>;

export const TEXT_FIELDS: readonly TextField[] = FIELDS;

export const DEFAULT_TEXTS = Object.fromEntries(
  FIELDS.map((f) => [f.key, f.def]),
) as SiteTexts;

export const TEXT_GROUPS: { id: TextGroup; title: string; intro?: string }[] = [
  { id: "home", title: "Accueil : carte des escales" },
  { id: "quiz", title: "Questionnaire : boutons, compteur, messages" },
  { id: "done", title: "Fin d'une escale" },
  { id: "notfound", title: "Page introuvable (erreur 404)" },
  { id: "share", title: "Partage du lien" },
];

/** Remplace {n}, {current}, {total}… dans un texte. */
export function fmt(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) =>
    k in vars ? String(vars[k]) : m,
  );
}
