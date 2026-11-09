import Link from "next/link";
import Scene from "@/components/Scene";
import EndAnimation from "@/components/EndAnimation";
import { isPanelDone } from "@/lib/progress";
import { mascotOf } from "@/lib/style";
import { getAnswers, getData } from "@/lib/store";
import { fmt } from "@/lib/texts";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [data, answers] = await Promise.all([getData(), getAnswers()]);
  const { config } = data;
  const t = config.texts;
  const panels = data.panels.filter((p) => p.published && p.questions.length > 0);
  const allDone = panels.length > 0 && panels.every((p) => isPanelDone(p, answers));

  return (
    <Scene style={config.homeStyle}>
      <main className="page">
        <header className="hero">
          <span className="boat" aria-hidden="true">
            {mascotOf(config.homeStyle)}
          </span>
          <h1>{config.siteTitle}</h1>
          <p className="greeting">{config.greeting}</p>
          {config.introMessage && (
            <p className="bubble">{config.introMessage}</p>
          )}
        </header>

        {panels.length === 0 ? (
          <p className="bubble center">{t.emptyMessage}</p>
        ) : (
          <>
            {t.mapTitle && <h2 className="section-title">{t.mapTitle}</h2>}
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
                        ? t.chipDone
                        : fmt(n > 1 ? t.chipMany : t.chipOne, { n })}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </>
        )}

        {allDone && config.outroMessage && (
          <EndAnimation
            message={config.outroMessage}
            theme={config.homeStyle.theme}
            mascot={mascotOf(config.homeStyle)}
          />
        )}

        <footer className="foot">
          <Link href="/admin" aria-label="Espace du capitaine">
            {t.footerSymbol}
          </Link>
        </footer>
      </main>
    </Scene>
  );
}
