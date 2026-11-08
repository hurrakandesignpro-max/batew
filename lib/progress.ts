import type { AnswersMap, Panel } from "./types";

/**
 * Une escale est « terminée » quand toutes ses questions à choix ont une
 * réponse. Les réponses libres sont facultatives.
 */
export function isPanelDone(panel: Panel, answers: AnswersMap): boolean {
  const required = panel.questions.filter((q) => q.type !== "text");
  if (required.length > 0) return required.every((q) => Boolean(answers[q.id]));
  return panel.questions.some((q) => Boolean(answers[q.id]));
}
