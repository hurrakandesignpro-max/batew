import { DEFAULT_STYLE } from "./style";
import { DEFAULT_TEXTS } from "./texts";
import type { AppData, PageStyle } from "./types";

const style = (patch: Partial<PageStyle> = {}): PageStyle => ({
  ...DEFAULT_STYLE,
  ...patch,
});

/**
 * Contenu de départ, utilisé tant que rien n'a été enregistré depuis /admin.
 * Tu peux tout modifier ou supprimer depuis l'interface.
 */
export const seedData: AppData = {
  config: {
    siteTitle: "Escale à deux",
    greeting: "Ahoy, ma moussaillonne !",
    introMessage:
      "J'ai préparé une petite surprise… Réponds à quelques questions pour qu'on choisisse ensemble notre prochaine escale. Il n'y a pas de mauvaise réponse, juste des idées pour passer un beau moment 💙",
    outroMessage:
      "Toutes les escales sont terminées ! J'ai tout noté, je prépare la suite du voyage… 🌅",
    texts: { ...DEFAULT_TEXTS },
    homeStyle: style(),
  },
  panels: [
    {
      id: "cap",
      title: "Cap sur l'aventure",
      emoji: "🧭",
      description: "Où met-on les voiles ?",
      published: true,
      style: style(),
      questions: [
        {
          id: "cap-1",
          text: "Plutôt quel genre de journée ?",
          type: "single",
          hint: "Un seul choix, suis ton instinct !",
          options: [
            { id: "a", label: "Farniente au bord de l'eau", emoji: "🏖️" },
            { id: "b", label: "Balade et découvertes", emoji: "🥾" },
            { id: "c", label: "Cocooning à la maison", emoji: "🛋️" },
            { id: "d", label: "Sortie gourmande", emoji: "🍽️" },
          ],
        },
        {
          id: "cap-2",
          text: "Lever ou coucher de soleil ?",
          type: "duel",
          options: [
            { id: "a", label: "Lever de soleil", emoji: "🌅" },
            { id: "b", label: "Coucher de soleil", emoji: "🌇" },
          ],
        },
        {
          id: "cap-3",
          text: "Les ingrédients d'une journée parfaite ?",
          type: "multi",
          hint: "Tu peux en choisir plusieurs.",
          options: [
            { id: "a", label: "Du soleil", emoji: "☀️" },
            { id: "b", label: "Pluie, plaid et chocolat chaud", emoji: "🌧️" },
            { id: "c", label: "De la musique", emoji: "🎶" },
            { id: "d", label: "Des photos souvenirs", emoji: "📷" },
            { id: "e", label: "Une glace", emoji: "🍦" },
          ],
        },
      ],
    },
    {
      id: "gourmandises",
      title: "Les gourmandises",
      emoji: "🦞",
      description: "Parce qu'un bon équipage mange bien.",
      published: true,
      style: style({ theme: "sunset" }),
      questions: [
        {
          id: "gourm-1",
          text: "Pour le repas, tu choisis ?",
          type: "single",
          options: [
            { id: "a", label: "Pizza", emoji: "🍕" },
            { id: "b", label: "Sushis", emoji: "🍣" },
            { id: "c", label: "Pâtes", emoji: "🍝" },
            { id: "d", label: "Burger", emoji: "🍔" },
            { id: "e", label: "Fruits de mer", emoji: "🦐" },
          ],
        },
        {
          id: "gourm-2",
          text: "Sucré ou salé ?",
          type: "duel",
          options: [
            { id: "a", label: "Sucré", emoji: "🍰" },
            { id: "b", label: "Salé", emoji: "🧀" },
          ],
        },
        {
          id: "gourm-3",
          text: "Un plat ou un dessert dont tu rêves en ce moment ?",
          type: "text",
          hint: "Même s'il est un peu fou, je note tout.",
          options: [],
        },
      ],
    },
    {
      id: "soiree",
      title: "Ambiance du soir",
      emoji: "🌙",
      description: "Quand la mer est calme et la lune est haute.",
      published: true,
      style: style({ theme: "night" }),
      questions: [
        {
          id: "soir-1",
          text: "Film ou jeu de société ?",
          type: "duel",
          options: [
            { id: "a", label: "Film", emoji: "🎬" },
            { id: "b", label: "Jeu de société", emoji: "🎲" },
          ],
        },
        {
          id: "soir-2",
          text: "Qu'est-ce qui te ferait plaisir ce soir-là ?",
          type: "multi",
          hint: "Coche tout ce qui te fait envie.",
          options: [
            { id: "a", label: "Bougies et ambiance douce", emoji: "🕯️" },
            { id: "b", label: "Une playlist rien qu'à nous", emoji: "🎧" },
            { id: "c", label: "Des snacks à grignoter", emoji: "🍿" },
            { id: "d", label: "Un moment détente", emoji: "🛁" },
            { id: "e", label: "Une partie de jeu vidéo", emoji: "🎮" },
          ],
        },
        {
          id: "soir-3",
          text: "Une envie, une demande spéciale pour le capitaine ?",
          type: "text",
          options: [],
        },
      ],
    },
    {
      id: "sakura",
      title: "Sous les cerisiers",
      emoji: "🌸",
      description: "Un hanami rien qu'à nous deux.",
      published: true,
      style: style({ theme: "sakura", trees: "both" }),
      intro: "Ferme les yeux : on est au Japon, sous les cerisiers en fleurs 🌸",
      questions: [
        {
          id: "sak-1",
          text: "Ton hanami idéal ?",
          type: "single",
          options: [
            { id: "a", label: "Pique-nique sous les fleurs", emoji: "🧺" },
            { id: "b", label: "Thé et douceurs japonaises", emoji: "🍵" },
            { id: "c", label: "Balade au milieu des lanternes", emoji: "🏮" },
            { id: "d", label: "Séance photo", emoji: "📷" },
          ],
        },
        {
          id: "sak-2",
          text: "Matcha ou thé au jasmin ?",
          type: "duel",
          options: [
            { id: "a", label: "Matcha", emoji: "🍵" },
            { id: "b", label: "Jasmin", emoji: "🌼" },
          ],
        },
        {
          id: "sak-3",
          text: "Un souhait à accrocher à une branche ?",
          type: "text",
          hint: "Comme sur les petits papiers des temples.",
          options: [],
        },
      ],
    },
  ],
};
