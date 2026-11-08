import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { clearAnswers, getAnswers, getData } from "@/lib/store";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ error: "Non autorisé." }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json({ answers: await getAnswers() });
}

/** DELETE /api/admin/answers            → efface toutes ses réponses
 *  DELETE /api/admin/answers?panelId=x  → efface celles d'une seule escale */
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  const panelId = new URL(req.url).searchParams.get("panelId");
  if (panelId) {
    const data = await getData();
    const panel = data.panels.find((p) => p.id === panelId);
    if (!panel) {
      return NextResponse.json({ error: "Escale introuvable." }, { status: 404 });
    }
    await clearAnswers(panel.questions.map((q) => q.id));
  } else {
    await clearAnswers();
  }

  return NextResponse.json({ answers: await getAnswers() });
}
