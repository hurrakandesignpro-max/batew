import type { CSSProperties, ReactNode } from "react";
import Decor from "@/components/Decor";
import { accentVars } from "@/lib/style";
import type { PageStyle } from "@/lib/types";

/** Enveloppe d'une page publique : thème (palette, fond) + décor animé. */
export default function Scene({
  style,
  children,
}: {
  style: PageStyle;
  children: ReactNode;
}) {
  return (
    <div
      className="scene"
      data-theme={style.theme}
      style={accentVars(style.accent) as CSSProperties | undefined}
    >
      <Decor style={style} />
      {children}
    </div>
  );
}
