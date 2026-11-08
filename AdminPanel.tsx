"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StyleEditor from "@/components/StyleEditor";
import TextsEditor from "@/components/TextsEditor";
import { DEFAULT_STYLE } from "@/lib/style";
import type {
  AnswersMap,
  AppData,
  Option,
  Panel,
  Question,
  QuestionType,
  SiteConfig,
  StoredAnswer,
} from "@/lib/types";

type Tab = "panels" | "answers" | "texts" | "look";
type Notice = { kind: "ok" | "error"; text: string } | null;

const TYPE_LABELS: Record<QuestionType, string> = {
  single: "Choix unique",
  multi: "Choix multiples",
  duel: "Ceci ou cela",
  text: "Réponse libre",
};

const EMOJIS = [
  "⛵", "⚓", "🌊", "🐚", "🦀", "🐠", "🐙", "🐳", "🐬", "🦭", "🏝️", "🌅",
  "🧭", "🦞", "🍤", "🍹", "🍦", "🌙", "⭐", "🎶", "🎬", "🎲", "📷", "🕯️",
  "💙", "💌", "🥂", "🍽️", "🌴", "🏖️", "🛟", "🐡", "🪸", "🍣", "🍕", "🎮",
  "🌸", "🌺", "🌷", "🍡", "🍵", "🏮", "🎏", "⛩️", "🗻", "🦋", "🌿", "🌕",
];

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
const blankOption = (): Option => ({ id: uid(), label: "", emoji: "" });
const blankQuestion = (): Question => ({
  id: uid(),
  text: "",
  type: "single",
  hint: "",
  options: [blankOption(), blankOption()],
});
const blankPanel = (): Panel => ({
  id: uid(),
  title: "",
  emoji: "🐚",
  description: "",
  published: false,
  questions: [blankQuestion()],
  style: { ...DEFAULT_STYLE },
});

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const copy = arr.slice();
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

function formatAnswer(q: Question, a?: StoredAnswer): string {
  if (!a) return "—";
  if (typeof a.value === "string") return a.value;
  return a.value
    .map((id) => {
      const o = q.options.find((opt) => opt.id === id);
      return o ? `${o.emoji ? o.emoji + " " : ""}${o.label}` : "(choix supprimé)";
    })
    .join(", ");
}

/* -------------------------------------------------------------------------- */

interface Props {
  initialData: AppData;
  initialAnswers: AnswersMap;
  storage: "redis" | "file" | "memory";
}

export default function AdminPanel({ initialData, initialAnswers, storage }: Props) {
  const router = useRouter();
  const [data, setData] = useState<AppData>(initialData);
  const [answers, setAnswers] = useState<AnswersMap>(initialAnswers);
  const [tab, setTab] = useState<Tab>("panels");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialData.panels[0]?.id ?? null,
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function change(fn: (d: AppData) => AppData) {
    setData((prev) => fn(prev));
    setDirty(true);
    setNotice(null);
  }

  function updatePanel(id: string, fn: (p: Panel) => Panel) {
    change((d) => ({ ...d, panels: d.panels.map((p) => (p.id === id ? fn(p) : p)) }));
  }

  function updateQuestion(panelId: string, qId: string, fn: (q: Question) => Question) {
    updatePanel(panelId, (p) => ({
      ...p,
      questions: p.questions.map((q) => (q.id === qId ? fn(q) : q)),
    }));
  }

  function updateConfig(patch: Partial<SiteConfig>) {
    change((d) => ({ ...d, config: { ...d.config, ...patch } }));
  }

  function addPanel() {
    const panel = blankPanel();
    change((d) => ({ ...d, panels: [...d.panels, panel] }));
    setSelectedId(panel.id);
    setTab("panels");
  }

  function deletePanel(id: string) {
    if (!window.confirm("Supprimer cette escale et toutes ses questions ?")) return;
    const remaining = data.panels.filter((p) => p.id !== id);
    change((d) => ({ ...d, panels: d.panels.filter((p) => p.id !== id) }));
    setSelectedId(remaining[0]?.id ?? null);
  }

  async function save() {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const json = (await res.json().catch(() => ({}))) as {
        data?: AppData;
        error?: string;
      };
      if (!res.ok || !json.data) {
        setNotice({ kind: "error", text: json.error ?? "Impossible d'enregistrer." });
        return;
      }
      setData(json.data);
      setDirty(false);
      setNotice({ kind: "ok", text: "Enregistré ✔ Le site est à jour." });
    } catch {
      setNotice({ kind: "error", text: "Connexion impossible, réessaie." });
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  async function refreshAnswers() {
    const res = await fetch("/api/admin/answers");
    if (res.ok) {
      const json = (await res.json()) as { answers: AnswersMap };
      setAnswers(json.answers);
    }
  }

  async function resetAnswers(panelId?: string) {
    const msg = panelId
      ? "Effacer ses réponses à cette escale ?"
      : "Effacer TOUTES ses réponses ?";
    if (!window.confirm(msg)) return;
    const url = panelId
      ? `/api/admin/answers?panelId=${encodeURIComponent(panelId)}`
      : "/api/admin/answers";
    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) {
      const json = (await res.json()) as { answers: AnswersMap };
      setAnswers(json.answers);
    }
  }

  const selected = data.panels.find((p) => p.id === selectedId) ?? null;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="admin">
      <datalist id="emoji-list">
        {EMOJIS.map((e) => (
          <option key={e} value={e} />
        ))}
      </datalist>

      <header className="adm-head">
        <div>
          <h1>⚓ Poste du capitaine</h1>
          <p className="muted">Prépare tes escales et regarde ses réponses.</p>
        </div>
        <div className="adm-head-actions">
          <a className="btn secondary small" href="/" target="_blank" rel="noreferrer">
            Voir le site ↗
          </a>
          <button className="btn secondary small" type="button" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </header>

      {storage === "memory" && (
        <div className="warn">
          ⚠️ Aucune base de données connectée : tes modifications et ses réponses
          seront perdues au prochain redémarrage du serveur. Connecte Upstash
          Redis dans l&apos;onglet Storage de ton projet Vercel (voir le README),
          puis redéploie.
        </div>
      )}
      {storage === "file" && (
        <div className="info">
          Mode local : les données sont enregistrées dans le dossier{" "}
          <code>.data/</code>.
        </div>
      )}

      <nav className="tabs" aria-label="Sections">
        {(
          [
            ["panels", "Escales"],
            ["answers", `Réponses (${answeredCount})`],
            ["texts", "Textes"],
            ["look", "Apparence"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={tab === key ? "tab active" : "tab"}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ---------------------------- ESCALES ---------------------------- */}
      {tab === "panels" && (
        <div className="adm-grid">
          <aside className="adm-card">
            <h2>Escales</h2>
            <ul className="plist">
              {data.panels.map((p, i) => (
                <li key={p.id} className={p.id === selectedId ? "sel" : ""}>
                  <button
                    type="button"
                    className="plist-main"
                    onClick={() => setSelectedId(p.id)}
                  >
                    <span className="pe">{p.emoji}</span>
                    <span className="pt">
                      {p.title || "Sans titre"}
                      <small>
                        {p.published ? "Visible" : "Brouillon"} · {p.questions.length}{" "}
                        question{p.questions.length > 1 ? "s" : ""}
                      </small>
                    </span>
                  </button>
                  <span className="mv">
                    <button
                      type="button"
                      aria-label="Monter"
                      disabled={i === 0}
                      onClick={() => change((d) => ({ ...d, panels: move(d.panels, i, -1) }))}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Descendre"
                      disabled={i === data.panels.length - 1}
                      onClick={() => change((d) => ({ ...d, panels: move(d.panels, i, 1) }))}
                    >
                      ↓
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            {data.panels.length === 0 && <p className="muted">Aucune escale pour l&apos;instant.</p>}
            <button type="button" className="btn small" onClick={addPanel}>
              ＋ Nouvelle escale
            </button>
          </aside>

          <section>
            {selected ? (
              <PanelEditor
                panel={selected}
                dirty={dirty}
                onPanel={(fn) => updatePanel(selected.id, fn)}
                onQuestion={(qId, fn) => updateQuestion(selected.id, qId, fn)}
                onDelete={() => deletePanel(selected.id)}
              />
            ) : (
              <div className="adm-card">
                <p className="muted">Crée ou sélectionne une escale pour l&apos;éditer.</p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ---------------------------- RÉPONSES ---------------------------- */}
      {tab === "answers" && (
        <div className="adm-stack">
          <div className="adm-row">
            <button type="button" className="btn secondary small" onClick={refreshAnswers}>
              ↻ Actualiser
            </button>
            <button
              type="button"
              className="btn danger small"
              onClick={() => resetAnswers()}
              disabled={answeredCount === 0}
            >
              Tout effacer
            </button>
          </div>

          {answeredCount === 0 && (
            <div className="adm-card">
              <p className="muted">Aucune réponse pour l&apos;instant. Patience, capitaine 🌊</p>
            </div>
          )}

          {data.panels
            .filter((p) => p.questions.some((q) => answers[q.id]))
            .map((p) => (
              <div className="adm-card" key={p.id}>
                <div className="adm-row">
                  <h2>
                    {p.emoji} {p.title || "Sans titre"}
                  </h2>
                  <button
                    type="button"
                    className="btn danger small"
                    onClick={() => resetAnswers(p.id)}
                  >
                    Effacer
                  </button>
                </div>
                <dl className="ans">
                  {p.questions.map((q) => (
                    <div key={q.id}>
                      <dt>{q.text || "(question sans texte)"}</dt>
                      <dd>{formatAnswer(q, answers[q.id])}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
        </div>
      )}

      {/* ---------------------------- TEXTES ---------------------------- */}
      {tab === "texts" && (
        <TextsEditor config={data.config} onConfig={updateConfig} />
      )}

      {/* ---------------------------- APPARENCE ---------------------------- */}
      {tab === "look" && (
        <StyleEditor
          title="Apparence de l'accueil"
          hint="Chaque escale a aussi sa propre apparence, dans l'onglet Escales."
          value={data.config.homeStyle}
          onChange={(patch) =>
            updateConfig({ homeStyle: { ...data.config.homeStyle, ...patch } })
          }
        />
      )}

      {/* ---------------------------- BARRE D'ENREGISTREMENT ---------------------------- */}
      <div className="savebar" role="status">
        {notice ? (
          <span className={notice.kind === "ok" ? "ok" : "error"}>{notice.text}</span>
        ) : dirty ? (
          <span>Modifications non enregistrées</span>
        ) : (
          <span className="muted">Tout est à jour</span>
        )}
        <button type="button" className="btn small" onClick={save} disabled={!dirty || saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function PanelEditor({
  panel,
  dirty,
  onPanel,
  onQuestion,
  onDelete,
}: {
  panel: Panel;
  dirty: boolean;
  onPanel: (fn: (p: Panel) => Panel) => void;
  onQuestion: (qId: string, fn: (q: Question) => Question) => void;
  onDelete: () => void;
}) {
  return (
    <div className="adm-stack">
      <div className="adm-card">
        <div className="adm-row">
          <h2>Cette escale</h2>
          <button type="button" className="btn danger small" onClick={onDelete}>
            Supprimer
          </button>
        </div>

        <div className="field-row">
          <label className="field emoji-field">
            <span>Emoji</span>
            <input
              className="in"
              list="emoji-list"
              maxLength={16}
              value={panel.emoji}
              onChange={(e) => onPanel((p) => ({ ...p, emoji: e.target.value }))}
            />
          </label>
          <label className="field grow">
            <span>Titre</span>
            <input
              className="in"
              maxLength={60}
              value={panel.title}
              onChange={(e) => onPanel((p) => ({ ...p, title: e.target.value }))}
              placeholder="Ex. Les gourmandises"
            />
          </label>
        </div>

        <label className="field">
          <span>Petite description (sous le titre sur la carte)</span>
          <input
            className="in"
            maxLength={200}
            value={panel.description}
            onChange={(e) => onPanel((p) => ({ ...p, description: e.target.value }))}
          />
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={panel.published}
            onChange={(e) => onPanel((p) => ({ ...p, published: e.target.checked }))}
          />
          <span>
            <strong>Visible sur le site</strong>
            <small>Décoché = brouillon, elle ne la voit pas.</small>
          </span>
        </label>

        <a
          className="preview-link"
          href={`/escale/${panel.id}`}
          target="_blank"
          rel="noreferrer"
        >
          Ouvrir {panel.published ? "l'escale" : "l'aperçu"} ↗
        </a>
        {dirty && (
          <small className="muted"> (enregistre d&apos;abord pour voir tes dernières modifs)</small>
        )}
      </div>

      <div className="adm-card">
        <h2>Textes de cette escale</h2>
        <p className="muted">
          Facultatif. Vide = on utilise les textes généraux (onglet Textes).
        </p>
        <label className="field">
          <span>Petit mot affiché avant la première question</span>
          <textarea
            className="in"
            rows={2}
            maxLength={300}
            value={panel.intro ?? ""}
            onChange={(e) => onPanel((p) => ({ ...p, intro: e.target.value }))}
            placeholder="Ex. Ferme les yeux : on est sous les cerisiers en fleurs 🌸"
          />
        </label>
        <label className="field">
          <span>Titre de fin d&apos;escale</span>
          <input
            className="in"
            maxLength={80}
            value={panel.doneTitle ?? ""}
            onChange={(e) => onPanel((p) => ({ ...p, doneTitle: e.target.value }))}
          />
        </label>
        <label className="field">
          <span>Message de fin d&apos;escale</span>
          <textarea
            className="in"
            rows={2}
            maxLength={300}
            value={panel.doneMessage ?? ""}
            onChange={(e) => onPanel((p) => ({ ...p, doneMessage: e.target.value }))}
          />
        </label>
      </div>

      <StyleEditor
        title="Apparence de cette escale"
        value={panel.style}
        onChange={(patch) => onPanel((p) => ({ ...p, style: { ...p.style, ...patch } }))}
      />

      {panel.questions.map((q, i) => (
        <QuestionEditor
          key={q.id}
          q={q}
          index={i}
          count={panel.questions.length}
          onChange={(fn) => onQuestion(q.id, fn)}
          onMove={(dir) =>
            onPanel((p) => ({ ...p, questions: move(p.questions, i, dir) }))
          }
          onDelete={() => {
            if (!window.confirm("Supprimer cette question ?")) return;
            onPanel((p) => ({ ...p, questions: p.questions.filter((x) => x.id !== q.id) }));
          }}
        />
      ))}

      <button
        type="button"
        className="btn secondary"
        onClick={() => onPanel((p) => ({ ...p, questions: [...p.questions, blankQuestion()] }))}
      >
        ＋ Ajouter une question
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function QuestionEditor({
  q,
  index,
  count,
  onChange,
  onMove,
  onDelete,
}: {
  q: Question;
  index: number;
  count: number;
  onChange: (fn: (q: Question) => Question) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const isDuel = q.type === "duel";

  function setType(type: QuestionType) {
    onChange((prev) => {
      let options = prev.options;
      if (type === "text") {
        options = [];
      } else {
        if (options.length === 0) options = [blankOption(), blankOption()];
        if (type === "duel") {
          options = options.slice(0, 2);
          while (options.length < 2) options.push(blankOption());
        }
      }
      return { ...prev, type, options };
    });
  }

  function setOption(i: number, patch: Partial<Option>) {
    onChange((prev) => ({
      ...prev,
      options: prev.options.map((o, k) => (k === i ? { ...o, ...patch } : o)),
    }));
  }

  return (
    <div className="adm-card qedit">
      <div className="adm-row">
        <h3>Question {index + 1}</h3>
        <span className="mv">
          <button type="button" aria-label="Monter" disabled={index === 0} onClick={() => onMove(-1)}>
            ↑
          </button>
          <button
            type="button"
            aria-label="Descendre"
            disabled={index === count - 1}
            onClick={() => onMove(1)}
          >
            ↓
          </button>
          <button type="button" aria-label="Supprimer" className="del" onClick={onDelete}>
            ✕
          </button>
        </span>
      </div>

      <label className="field">
        <span>Type de question</span>
        <select
          className="in"
          value={q.type}
          onChange={(e) => setType(e.target.value as QuestionType)}
        >
          {(Object.keys(TYPE_LABELS) as QuestionType[]).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Question</span>
        <input
          className="in"
          maxLength={200}
          value={q.text}
          onChange={(e) => onChange((prev) => ({ ...prev, text: e.target.value }))}
          placeholder="Ex. Plutôt mer ou montagne ?"
        />
      </label>

      <label className="field">
        <span>Petit texte d&apos;aide (facultatif)</span>
        <input
          className="in"
          maxLength={150}
          value={q.hint ?? ""}
          onChange={(e) => onChange((prev) => ({ ...prev, hint: e.target.value }))}
        />
      </label>

      {q.type !== "text" && (
        <div className="options">
          <span className="options-title">
            {isDuel ? "Les deux choix" : "Les choix"}
          </span>
          {q.options.map((o, i) => (
            <div className="opt-row" key={o.id}>
              <input
                className="in opt-emoji"
                list="emoji-list"
                maxLength={16}
                aria-label="Emoji du choix"
                placeholder="🙂"
                value={o.emoji ?? ""}
                onChange={(e) => setOption(i, { emoji: e.target.value })}
              />
              <input
                className="in grow"
                maxLength={80}
                aria-label={`Choix ${i + 1}`}
                placeholder={isDuel ? (i === 0 ? "Choix A" : "Choix B") : `Choix ${i + 1}`}
                value={o.label}
                onChange={(e) => setOption(i, { label: e.target.value })}
              />
              {!isDuel && (
                <button
                  type="button"
                  className="del"
                  aria-label="Retirer ce choix"
                  disabled={q.options.length <= 2}
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      options: prev.options.filter((_, k) => k !== i),
                    }))
                  }
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {!isDuel && q.options.length < 12 && (
            <button
              type="button"
              className="btn secondary small"
              onClick={() =>
                onChange((prev) => ({ ...prev, options: [...prev.options, blankOption()] }))
              }
            >
              ＋ Ajouter un choix
            </button>
          )}
        </div>
      )}
      {q.type === "text" && (
        <p className="muted">Elle pourra écrire librement (500 caractères max, facultatif).</p>
      )}
    </div>
  );
}
