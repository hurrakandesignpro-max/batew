"use client";

import { DEFAULT_TEXTS, TEXT_FIELDS, TEXT_GROUPS, type TextKey } from "@/lib/texts";
import type { SiteConfig } from "@/lib/types";

interface RowProps {
  label: string;
  value: string;
  max: number;
  multiline?: boolean;
  hint?: string;
  def?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

function TextRow({
  label,
  value,
  max,
  multiline,
  hint,
  def,
  placeholder,
  onChange,
}: RowProps) {
  return (
    <label className="field">
      <span>
        {label}
        {def !== undefined && value !== def && (
          <button
            type="button"
            className="reset"
            onClick={(e) => {
              e.preventDefault();
              onChange(def);
            }}
          >
            ↺ remettre par défaut
          </button>
        )}
      </span>
      {multiline ? (
        <textarea
          className="in"
          rows={3}
          maxLength={max}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="in"
          maxLength={max}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <small className="muted">{hint}</small>}
    </label>
  );
}

/** Tous les textes du site, regroupés par page. */
export default function TextsEditor({
  config,
  onConfig,
}: {
  config: SiteConfig;
  onConfig: (patch: Partial<SiteConfig>) => void;
}) {
  const setText = (key: TextKey, value: string) =>
    onConfig({ texts: { ...config.texts, [key]: value } });

  return (
    <div className="adm-stack">
      <div className="info">
        Ici, tu changes <strong>tous</strong> les textes du site. Pour un texte
        obligatoire, laisser le champ vide remet le texte par défaut. Pense à
        cliquer sur <strong>Enregistrer</strong> en bas.
      </div>

      <div className="adm-card">
        <h2>Accueil : en-tête</h2>
        <TextRow
          label="Titre du site"
          max={60}
          value={config.siteTitle}
          onChange={(v) => onConfig({ siteTitle: v })}
        />
        <TextRow
          label="Salutation (ex. « Ahoy, ma moussaillonne ! »)"
          max={80}
          value={config.greeting}
          onChange={(v) => onConfig({ greeting: v })}
        />
        <TextRow
          label="Message d'accueil"
          max={600}
          multiline
          hint="Laisse vide pour ne rien afficher."
          value={config.introMessage}
          onChange={(v) => onConfig({ introMessage: v })}
        />
        <TextRow
          label="Message de fin (affiché sur l'accueil quand toutes les escales sont terminées)"
          max={600}
          multiline
          hint="Laisse vide pour ne rien afficher."
          value={config.outroMessage}
          onChange={(v) => onConfig({ outroMessage: v })}
        />
      </div>

      {TEXT_GROUPS.map((group) => (
        <div className="adm-card" key={group.id}>
          <h2>{group.title}</h2>
          {group.intro && <p className="muted">{group.intro}</p>}
          {TEXT_FIELDS.filter((f) => f.group === group.id).map((f) => (
            <TextRow
              key={f.key}
              label={f.label}
              max={f.max}
              multiline={f.multiline}
              hint={f.hint}
              def={f.def}
              placeholder={f.optional ? "(masqué)" : undefined}
              value={config.texts[f.key as TextKey] ?? DEFAULT_TEXTS[f.key as TextKey]}
              onChange={(v) => setText(f.key as TextKey, v)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
