import type { AtomDef } from "../ir.js";

const text: AtomDef = {
  kind: "text",
  category: "text",
  docs: "A run of inline text.",
  props: {
    value: { type: "string", required: true },
    weight: { type: "any" },
    size: { type: "any" },
    color: { type: "string" },
  },
  children: { allowed: false },
};

const heading: AtomDef = {
  kind: "heading",
  category: "text",
  docs: "Semantic heading, level 1-6.",
  props: {
    value: { type: "string", required: true },
    level: { type: { kind: "enum", values: ["1", "2", "3", "4", "5", "6"] }, default: "1" },
  },
  children: { allowed: false },
};

const paragraph: AtomDef = {
  kind: "paragraph",
  category: "text",
  docs: "A block of body text.",
  props: { value: { type: "string", required: true } },
  children: { allowed: false },
};

const label: AtomDef = {
  kind: "label",
  category: "text",
  docs: "Label for a form field or control.",
  props: {
    value: { type: "string", required: true },
    for: { type: "string" },
  },
  children: { allowed: false },
};

const code: AtomDef = {
  kind: "code",
  category: "text",
  docs: "Inline or block code.",
  props: {
    value: { type: "string", required: true },
    language: { type: "string" },
    block: { type: "boolean", default: false },
  },
  children: { allowed: false },
};

const markdown: AtomDef = {
  kind: "markdown",
  category: "text",
  docs: "Rendered markdown.",
  props: { value: { type: "string", required: true } },
  children: { allowed: false },
};

export const TEXT_ATOMS: AtomDef[] = [text, heading, paragraph, label, code, markdown];
