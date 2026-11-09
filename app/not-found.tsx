import Link from "next/link";
import Scene from "@/components/Scene";
import { mascotOf } from "@/lib/style";
import { seedData } from "@/lib/seed";
import { getData } from "@/lib/store";

export default async function NotFound() {
  let config = seedData.config;
  try {
    config = (await getData()).config;
  } catch {
    // on garde les textes par défaut
  }
  const t = config.texts;

  return (
    <Scene style={config.homeStyle}>
      <main className="page">
        <div className="hero">
          <span className="boat" aria-hidden="true">
            {config.homeStyle.mascot ? mascotOf(config.homeStyle) : "🛟"}
          </span>
          <h1>{t.notFoundTitle}</h1>
          <p className="bubble">{t.notFoundMessage}</p>
          <Link href="/" className="btn">
            {t.notFoundButton}
          </Link>
        </div>
      </main>
    </Scene>
  );
}
