import { NextResponse } from "next/server";
import { getData, saveAnswers } from "@/lib/store";
import type { AnswersMap } from "@/lib/types";

export const dynamic = "force-dynamic";

const bad = (error: string, status = 400) =>
  NextResponse.json({ error }, { status });

/** Enregistre les réponses à une escale (publique : c'est elle qui l'appelle). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("Requête invalide.");
  }

  const { panelId, answers } = (body ?? {}) as {
    panelId?: unknown;
    answers?: unknown;
  };
  if (typeof panelId !== "string" || !answers || typeof answers !== "object") {
    return bad("Requête invalide.");
  }

  const data = await getData();
  const panel = data.panels.find((p) => p.id === panelId && p.published);
  if (!panel) return bad("Cette escale n'existe pas.", 404);

  const incoming = answers as Record<string, unknown>;
  const now = new Date().toISOString();
  const patch: AnswersMap = {};
  const removeIds: string[] = [];

  for (const q of panel.questions) {
    const value = incoming[q.id];

    if (q.type === "text") {
      const text = typeof value === "string" ? value.trim().slice(0, 500) : "";
      if (text) patch[q.id] = { value: text, at: now };
      else removeIds.push(q.id);
      continue;
    }

    if (!Array.isArray(value)) return bad("Il manque une réponse.");
    const ids = Array.from(
      new Set(value.filter((v): v is string => typeof v === "string")),
    );
    const valid = ids.filter((id) => q.options.some((o) => o.id === id));
    if (valid.length === 0 || valid.length !== ids.length) {
      return bad("Une réponse est invalide.");
    }
    if (q.type !== "multi" && valid.length !== 1) {
      return bad("Une seule réponse est possible ici.");
    }
    patch[q.id] = { value: valid, at: now };
  }

  await saveAnswers(patch, removeIds);
  return NextResponse.json({ ok: true });
}
