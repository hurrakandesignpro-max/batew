import Link from "next/link";
import ThemeShell from "@/components/ThemeShell";
import { fill, resolveLook, THEMES } from "@/lib/defaults";
import { isPanelDone } from "@/lib/progress";
import { getAnswers, getData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [data, answers] = await Promise.all([getData(), getAnswers()]);
  const { config } = data;
  const { texts } = config;
  const look = resolveLook(config);
  const panels = data.panels.filter((p) => p.published && p.questions.length > 0);
  const allDone = panels.length > 0 && panels.every((p) => isPanelDone(p, answers));

  return (
    <ThemeShell {...look}>
      <main className="page">
        <header className="hero">
          <span className="boat" aria-hidden="true">
            {config.heroEmoji || THEMES[look.theme].emoji}
          </span>
          <h1>{config.siteTitle}</h1>
          <p className="greeting">{config.greeting}</p>
          {config.introMessage && (
            <p className="bubble">{config.introMessage}</p>
          )}
        </header>

        {panels.length === 0 ? (
          <p className="bubble center">{texts.homeEmpty}</p>
        ) : (
          <>
            <h2 className="section-title">{texts.homeTitle}</h2>
            <nav className="escales" aria-label="Escales">
              {panels.map((panel) => {
                const done = isPanelDone(panel, answers);
                const n = panel.questions.length;
                return (
                  <Link
                    key={panel.id}
                    href={`/escale/${panel.id}`}
                    className="escale"
                  >
                    <span className="escale-emoji" aria-hidden="true">
                      {panel.emoji}
                    </span>
                    <span className="escale-body">
                      <h3>{panel.title}</h3>
                      {panel.description && <p>{panel.description}</p>}
                    </span>
                    <span className={`chip ${done ? "done" : ""}`}>
                      {done
                        ? texts.chipDone
                        : n === 1
                          ? texts.chipOne
                          : fill(texts.chipMany, { n })}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </>
        )}

        {allDone && config.outroMessage && (
          <p className="bubble center outro">{config.outroMessage}</p>
        )}

        <footer className="foot">
          <Link href="/admin" aria-label="Espace du capitaine">
            ⚓
          </Link>
        </footer>
      </main>
    </ThemeShell>
  );
}
