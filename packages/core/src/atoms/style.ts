import type { AtomDef } from "../ir.js";

const theme: AtomDef = {
  kind: "theme",
  category: "style",
  docs: "Theme token root; declares colors, spacing scale, typography.",
  props: {
    tokens: { type: "any", docs: "Object of design tokens" },
    mode: { type: { kind: "enum", values: ["light", "dark", "auto"] }, default: "auto" },
  },
  children: { allowed: true },
};

const style: AtomDef = {
  kind: "style",
  category: "style",
  docs: "Inline style wrapper; applies arbitrary CSS-like props to its child.",
  props: { rules: { type: "any", required: true } },
  children: { allowed: true, max: 1 },
};

export const STYLE_ATOMS: AtomDef[] = [theme, style];
