import Link from "next/link";
import { notFound } from "next/navigation";
import Quiz from "@/components/Quiz";
import ThemeShell from "@/components/ThemeShell";
import { isAdmin } from "@/lib/auth";
import { resolveLook, THEMES } from "@/lib/defaults";
import { getAnswers, getData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function EscalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, answers] = await Promise.all([getData(), getAnswers()]);

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

  const look = resolveLook(data.config, panel);
  const marker = panel.marker || THEMES[look.theme].emoji;
  const { texts } = data.config;

  return (
    <ThemeShell {...look}>
      <main className="page">
        <div className="topbar">
          <Link href="/" className="back">
            {texts.backLink}
          </Link>
          <span className="topbar-title">
            {panel.emoji} {panel.title}
          </span>
        </div>
        {preview && (
          <p className="bubble preview-note">
            🔍 Aperçu du brouillon : rien n&apos;est enregistré.
          </p>
        )}
        <Quiz
          panel={panel}
          initial={initial}
          preview={preview}
          texts={texts}
          marker={marker}
        />
      </main>
    </ThemeShell>
  );
}
