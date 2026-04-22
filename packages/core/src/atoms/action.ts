import type { AtomDef } from "../ir.js";

const button: AtomDef = {
  kind: "button",
  category: "action",
  docs: "Clickable button. Style variants: primary, secondary, ghost, danger.",
  props: {
    label: { type: "string" },
    onClick: { type: "expr" },
    variant: { type: { kind: "enum", values: ["primary", "secondary", "ghost", "danger"] }, default: "primary" },
    size: { type: { kind: "enum", values: ["sm", "md", "lg"] }, default: "md" },
    disabled: { type: "boolean", default: false },
    type: { type: { kind: "enum", values: ["button", "submit", "reset"] }, default: "button" },
  },
  children: { allowed: true },
};

const link: AtomDef = {
  kind: "link",
  category: "action",
  docs: "Navigational link.",
  props: {
    href: { type: "string", required: true },
    label: { type: "string" },
    external: { type: "boolean", default: false },
  },
  children: { allowed: true },
};

export const ACTION_ATOMS: AtomDef[] = [button, link];
