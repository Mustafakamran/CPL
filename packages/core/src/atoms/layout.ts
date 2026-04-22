import type { AtomDef } from "../ir.js";

const box: AtomDef = {
  kind: "box",
  category: "layout",
  docs: "Rectangular container with optional padding, margin, background, border.",
  props: {
    padding: { type: "any", docs: "CSS-like spacing value" },
    margin: { type: "any" },
    background: { type: "string" },
    border: { type: "string" },
    radius: { type: "any" },
    width: { type: "any" },
    height: { type: "any" },
  },
  children: { allowed: true },
};

const stack: AtomDef = {
  kind: "stack",
  category: "layout",
  docs: "Children stacked along an axis; defaults to vertical.",
  props: {
    axis: { type: { kind: "enum", values: ["vertical", "horizontal"] }, default: "vertical" },
    gap: { type: "any", default: 0 },
    align: { type: { kind: "enum", values: ["start", "center", "end", "stretch"] }, default: "stretch" },
    justify: { type: { kind: "enum", values: ["start", "center", "end", "between", "around"] }, default: "start" },
    wrap: { type: "boolean", default: false },
  },
  children: { allowed: true },
};

const row: AtomDef = {
  kind: "row",
  category: "layout",
  docs: "Horizontal stack shorthand.",
  props: { gap: { type: "any", default: 0 }, align: { type: "string", default: "center" }, justify: { type: "string", default: "start" } },
  children: { allowed: true },
};

const column: AtomDef = {
  kind: "column",
  category: "layout",
  docs: "Vertical stack shorthand.",
  props: { gap: { type: "any", default: 0 }, align: { type: "string", default: "stretch" }, justify: { type: "string", default: "start" } },
  children: { allowed: true },
};

const grid: AtomDef = {
  kind: "grid",
  category: "layout",
  docs: "2D grid layout.",
  props: {
    columns: { type: "any", default: 1 },
    rows: { type: "any" },
    gap: { type: "any", default: 0 },
  },
  children: { allowed: true },
};

const flex: AtomDef = {
  kind: "flex",
  category: "layout",
  docs: "Generic flex container for fine-grained control.",
  props: {
    direction: { type: { kind: "enum", values: ["row", "column"] }, default: "row" },
    gap: { type: "any", default: 0 },
    align: { type: "string", default: "stretch" },
    justify: { type: "string", default: "start" },
    wrap: { type: "boolean", default: false },
  },
  children: { allowed: true },
};

const spacer: AtomDef = {
  kind: "spacer",
  category: "layout",
  docs: "Flexible empty space that pushes siblings apart.",
  props: { size: { type: "any" } },
  children: { allowed: false },
};

const divider: AtomDef = {
  kind: "divider",
  category: "layout",
  docs: "Thin visual separator line.",
  props: {
    orientation: { type: { kind: "enum", values: ["horizontal", "vertical"] }, default: "horizontal" },
  },
  children: { allowed: false },
};

const scrollView: AtomDef = {
  kind: "scroll-view",
  category: "layout",
  docs: "Scrollable viewport.",
  props: {
    axis: { type: { kind: "enum", values: ["vertical", "horizontal", "both"] }, default: "vertical" },
  },
  children: { allowed: true },
};

const safeArea: AtomDef = {
  kind: "safe-area",
  category: "layout",
  docs: "Respect platform safe-area insets (notches, status bars).",
  props: {},
  children: { allowed: true },
};

const sticky: AtomDef = {
  kind: "sticky",
  category: "layout",
  docs: "Sticks to an edge while parent scrolls.",
  props: { edge: { type: { kind: "enum", values: ["top", "bottom", "left", "right"] }, default: "top" } },
  children: { allowed: true },
};

const center: AtomDef = {
  kind: "center",
  category: "layout",
  docs: "Centers its child horizontally and vertically.",
  props: {},
  children: { allowed: true },
};

const aspect: AtomDef = {
  kind: "aspect",
  category: "layout",
  docs: "Maintains a fixed aspect ratio.",
  props: { ratio: { type: "number", default: 1 } },
  children: { allowed: true },
};

const portal: AtomDef = {
  kind: "portal",
  category: "layout",
  docs: "Render children in a detached DOM/view location (overlays, modals).",
  props: { target: { type: "string" } },
  children: { allowed: true },
};

export const LAYOUT_ATOMS: AtomDef[] = [
  box, stack, row, column, grid, flex, spacer, divider,
  scrollView, safeArea, sticky, center, aspect, portal,
];
