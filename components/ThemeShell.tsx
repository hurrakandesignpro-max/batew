import type { CSSProperties, ReactNode } from "react";
import { darken, HEX } from "@/lib/color";
import type { DecorLevel, ThemeId } from "@/lib/types";
import Decor from "./Decor";

/** Enveloppe d'une page publique : fond, décor et couleurs du thème choisi. */
export default function ThemeShell({
  theme,
  decor,
  accent,
  children,
}: {
  theme: ThemeId;
  decor: DecorLevel;
  accent?: string;
  children: ReactNode;
}) {
  const style =
    accent && HEX.test(accent)
      ? ({ "--coral": accent, "--coral-dark": darken(accent) } as CSSProperties)
      : undefined;

  return (
    <div className="shell" data-theme={theme} style={style}>
      <div className="bg-layer" aria-hidden="true" />
      <Decor theme={theme} decor={decor} />
      {children}
    </div>
  );
}
