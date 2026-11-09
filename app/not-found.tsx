import Link from "next/link";
import ThemeShell from "@/components/ThemeShell";

export default function NotFound() {
  return (
    <ThemeShell theme="sea" decor="normal">
      <main className="page">
        <div className="hero">
          <span className="boat" role="img" aria-label="Bouée">
            🛟
          </span>
          <h1>Cette mer n&apos;existe pas</h1>
          <p className="bubble">
            On a dû se tromper de cap… Reviens à la carte, on repart de zéro 🧭
          </p>
          <Link href="/" className="btn">
            Retour à la carte
          </Link>
        </div>
      </main>
    </ThemeShell>
  );
}
