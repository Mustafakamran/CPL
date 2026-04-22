import type { AtomDef } from "../ir.js";

const commonInput = {
  value: { type: "expr" as const },
  onChange: { type: "expr" as const },
  placeholder: { type: "string" as const },
  disabled: { type: "boolean" as const, default: false },
  name: { type: "string" as const },
};

const textInput: AtomDef = {
  kind: "text-input",
  category: "input",
  docs: "Single-line text input.",
  props: {
    ...commonInput,
    kind: { type: { kind: "enum", values: ["text", "email", "password", "tel", "url", "search"] }, default: "text" },
  },
  children: { allowed: false },
};

const numberInput: AtomDef = {
  kind: "number-input",
  category: "input",
  docs: "Numeric input with optional min/max/step.",
  props: { ...commonInput, min: { type: "number" }, max: { type: "number" }, step: { type: "number" } },
  children: { allowed: false },
};

const checkbox: AtomDef = {
  kind: "checkbox",
  category: "input",
  docs: "Boolean checkbox.",
  props: { checked: { type: "expr" }, onChange: { type: "expr" }, disabled: { type: "boolean", default: false } },
  children: { allowed: false },
};

const radio: AtomDef = {
  kind: "radio",
  category: "input",
  docs: "Single radio button. Group via `name` prop.",
  props: {
    name: { type: "string", required: true },
    value: { type: "string", required: true },
    checked: { type: "expr" },
    onChange: { type: "expr" },
  },
  children: { allowed: false },
};

const switchAtom: AtomDef = {
  kind: "switch",
  category: "input",
  docs: "Boolean on/off toggle.",
  props: { value: { type: "expr" }, onChange: { type: "expr" }, disabled: { type: "boolean", default: false } },
  children: { allowed: false },
};

const slider: AtomDef = {
  kind: "slider",
  category: "input",
  docs: "Numeric slider.",
  props: {
    value: { type: "expr" },
    onChange: { type: "expr" },
    min: { type: "number", default: 0 },
    max: { type: "number", default: 100 },
    step: { type: "number", default: 1 },
  },
  children: { allowed: false },
};

const selectAtom: AtomDef = {
  kind: "select",
  category: "input",
  docs: "Dropdown select.",
  props: {
    value: { type: "expr" },
    onChange: { type: "expr" },
    options: { type: { kind: "array", of: "any" }, required: true, docs: "[{value, label}]" },
    placeholder: { type: "string" },
  },
  children: { allowed: false },
};

const textarea: AtomDef = {
  kind: "textarea",
  category: "input",
  docs: "Multi-line text input.",
  props: { ...commonInput, rows: { type: "number", default: 3 } },
  children: { allowed: false },
};

const fileInput: AtomDef = {
  kind: "file-input",
  category: "input",
  docs: "File picker.",
  props: {
    onChange: { type: "expr" },
    accept: { type: "string" },
    multiple: { type: "boolean", default: false },
  },
  children: { allowed: false },
};

const dateInput: AtomDef = {
  kind: "date-input",
  category: "input",
  docs: "Date picker.",
  props: {
    value: { type: "expr" },
    onChange: { type: "expr" },
    min: { type: "string" },
    max: { type: "string" },
  },
  children: { allowed: false },
};

const colorInput: AtomDef = {
  kind: "color-input",
  category: "input",
  docs: "Color picker.",
  props: { value: { type: "expr" }, onChange: { type: "expr" } },
  children: { allowed: false },
};

const rangeInput: AtomDef = {
  kind: "range-input",
  category: "input",
  docs: "Dual-thumb range slider.",
  props: {
    valueLow: { type: "expr" },
    valueHigh: { type: "expr" },
    onChange: { type: "expr" },
    min: { type: "number", default: 0 },
    max: { type: "number", default: 100 },
    step: { type: "number", default: 1 },
  },
  children: { allowed: false },
};

export const INPUT_ATOMS: AtomDef[] = [
  textInput, numberInput, checkbox, radio, switchAtom, slider,
  selectAtom, textarea, fileInput, dateInput, colorInput, rangeInput,
];
