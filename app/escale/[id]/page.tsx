import Link from "next/link";
import { notFound } from "next/navigation";
import Quiz from "@/components/Quiz";
import Scene from "@/components/Scene";
import { isAdmin } from "@/lib/auth";
import { mascotOf } from "@/lib/style";
import { getAnswers, getData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function EscalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, answers] = await Promise.all([getData(), getAnswers()]);
  const t = data.config.texts;

  const panel = data.panels.find((p) => p.id === id);
  if (!panel) notFound();

  // Un brouillon n'est visible que par le capitaine (aperçu, rien n'est enregistré).
  const preview = !panel.published;
  if (preview && !(await isAdmin())) notFound();

  const initial: Record<string, string[] | string> = {};
  for (const q of panel.questions) {
    const stored = answers[q.id];
    if (stored) initial[q.id] = stored.value;
  }

  return (
    <Scene style={panel.style}>
      <main className="page">
        <div className="topbar">
          <Link href="/" className="back">
            {t.backLink}
          </Link>
          <span className="topbar-title">
            {panel.emoji} {panel.title}
          </span>
        </div>
        {preview && <p className="bubble preview-note">{t.previewNote}</p>}
        <Quiz
          panel={panel}
          initial={initial}
          preview={preview}
          texts={t}
          mascot={mascotOf(panel.style)}
        />
      </main>
    </Scene>
  );
}
