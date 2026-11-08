import AdminLogin from "@/components/AdminLogin";
import AdminPanel from "@/components/AdminPanel";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { getAnswers, getData, storageMode } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Poste du capitaine ⚓",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <main className="admin">
        <div className="adm-card">
          <h1>⚓ Poste du capitaine</h1>
          <p>
            L&apos;espace admin est désactivé : la variable d&apos;environnement{" "}
            <code>ADMIN_PASSWORD</code> n&apos;est pas définie.
          </p>
          <p className="muted">
            Sur Vercel : Settings → Environment Variables, puis redéploie. En
            local : crée un fichier <code>.env.local</code> (voir{" "}
            <code>.env.example</code>).
          </p>
        </div>
      </main>
    );
  }

  if (!(await isAdmin())) return <AdminLogin />;

  const [data, answers] = await Promise.all([getData(), getAnswers()]);
  return (
    <AdminPanel
      initialData={data}
      initialAnswers={answers}
      storage={storageMode()}
    />
  );
}
