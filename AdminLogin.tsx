"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setError(json.error ?? "Connexion impossible.");
        return;
      }
      router.refresh();
    } catch {
      setError("Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin login">
      <form className="adm-card" onSubmit={submit}>
        <div className="login-boat" aria-hidden="true">
          ⚓
        </div>
        <h1>Poste du capitaine</h1>
        <p className="muted">Mot de passe, matelot !</p>
        <input
          className="in"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
        />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn" type="submit" disabled={loading || !password}>
          {loading ? "…" : "Monter à bord"}
        </button>
      </form>
    </main>
  );
}
