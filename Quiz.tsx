"use client";

import Link from "next/link";
import { useState } from "react";
import { fmt } from "@/lib/texts";
import type { Panel, Question, SiteTexts } from "@/lib/types";

type Answers = Record<string, string[] | string>;

interface Props {
  panel: Panel;
  initial: Answers;
  preview: boolean;
  texts: SiteTexts;
  /** Emoji de la barre de progression et de la fin d'escale. */
  mascot: string;
}

function isAnswered(q: Question, answers: Answers): boolean {
  if (q.type === "text") return true; // facultatif
  const a = answers[q.id];
  return Array.isArray(a) && a.length > 0;
}

export default function Quiz({ panel, initial, preview, texts, mascot }: Props) {
  const [answers, setAnswers] = useState<Answers>(initial);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = panel.questions.length;
  const q = panel.questions[index];

  if (total === 0 || !q) {
    return <p className="bubble center">{texts.noQuestions}</p>;
  }

  if (done) {
    return (
      <section className="qcard done" aria-live="polite">
        <div className="big" aria-hidden="true">
          {mascot}
        </div>
        <h2>{panel.doneTitle || texts.doneTitle}</h2>
        {(preview ? texts.donePreview : panel.doneMessage || texts.doneMessage) && (
          <p className="muted">
            {preview ? texts.donePreview : panel.doneMessage || texts.doneMessage}
          </p>
        )}
        <Link href="/" className="btn">
          {texts.doneButton}
        </Link>
      </section>
    );
  }

  const isLast = index === total - 1;
  const progress = (index / total) * 100;
  const current = answers[q.id];

  function toggle(optionId: string) {
    setError(null);
    setAnswers((prev) => {
      if (q.type === "multi") {
        const list = Array.isArray(prev[q.id]) ? (prev[q.id] as string[]) : [];
        const next = list.includes(optionId)
          ? list.filter((id) => id !== optionId)
          : [...list, optionId];
        return { ...prev, [q.id]: next };
      }
      return { ...prev, [q.id]: [optionId] };
    });
  }

  async function submit() {
    if (preview) {
      setDone(true);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panelId: panel.id, answers }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setError(json.error ?? texts.errorGeneric);
        return;
      }
      setDone(true);
    } catch {
      setError(texts.errorNetwork);
    } finally {
      setSaving(false);
    }
  }

  function next() {
    if (!isAnswered(q, answers)) return;
    if (isLast) void submit();
    else setIndex((i) => i + 1);
  }

  return (
    <section>
      {index === 0 && panel.intro && (
        <p className="bubble center">{panel.intro}</p>
      )}
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={index}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
        <span className="progress-boat" style={{ left: `${progress}%` }} aria-hidden="true">
          {mascot}
        </span>
      </div>
      <p className="counter">
        {fmt(texts.counter, { current: index + 1, total })}
      </p>

      <div className="qcard" key={q.id}>
        <h2 className="qtext">{q.text}</h2>
        {q.hint && <p className="qhint">{q.hint}</p>}
        {!q.hint && q.type === "multi" && texts.multiHint && (
          <p className="qhint">{texts.multiHint}</p>
        )}

        {q.type === "text" ? (
          <textarea
            className="textarea"
            maxLength={500}
            placeholder={texts.textPlaceholder}
            value={typeof current === "string" ? current : ""}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
            }
          />
        ) : (
          <div className={q.type === "duel" ? "duel" : "choices"} role={q.type === "multi" ? "group" : "radiogroup"}>
            {q.options.map((o) => {
              const selected = Array.isArray(current) && current.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  className="choice"
                  aria-pressed={selected}
                  onClick={() => toggle(o.id)}
                >
                  {o.emoji && (
                    <span className="e" aria-hidden="true">
                      {o.emoji}
                    </span>
                  )}
                  <span>{o.label}</span>
                  {q.type === "multi" && (
                    <span className="tick" aria-hidden="true">
                      {selected ? "✓" : ""}
                    </span>
                  )}
                </button>
              );
            })}
            {q.type === "duel" && (
              <span className="vs" aria-hidden="true">
                {texts.duelWord}
              </span>
            )}
          </div>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0 || saving}
          >
            {texts.prevButton}
          </button>
          <button
            type="button"
            className="btn"
            onClick={next}
            disabled={!isAnswered(q, answers) || saving}
          >
            {saving ? texts.savingButton : isLast ? texts.finishButton : texts.nextButton}
          </button>
        </div>
      </div>
    </section>
  );
}
