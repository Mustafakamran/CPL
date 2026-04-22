import type { AtomDef } from "../ir.js";

const when: AtomDef = {
  kind: "when",
  category: "logic",
  docs: "Conditionally render children based on `cond`.",
  props: { cond: { type: "expr", required: true } },
  children: { allowed: true },
};

const repeat: AtomDef = {
  kind: "repeat",
  category: "logic",
  docs: "Iterate `source` and render child template per item. Item bound as `item`, index as `index`.",
  props: {
    source: { type: "expr", required: true },
    as: { type: "string", default: "item" },
    indexAs: { type: "string", default: "index" },
    key: { type: "expr" },
  },
  children: { allowed: true },
};

const match: AtomDef = {
  kind: "match",
  category: "logic",
  docs: "Multi-branch switch. Children should be `when` or fallback.",
  props: { value: { type: "expr", required: true } },
  children: { allowed: true },
};

const bind: AtomDef = {
  kind: "bind",
  category: "logic",
  docs: "Two-way bind a prop expression to a state.",
  props: {
    target: { type: "string", required: true, docs: "State path to bind to" },
    to: { type: "expr", required: true, docs: "Element prop to bind" },
  },
  children: { allowed: false },
};

const state: AtomDef = {
  kind: "state",
  category: "logic",
  docs: "Declare a reactive state variable in scope.",
  props: {
    name: { type: "string", required: true },
    initial: { type: "any" },
  },
  children: { allowed: true },
};

const action: AtomDef = {
  kind: "action",
  category: "logic",
  docs: "Name an action body; callable from event handlers.",
  props: {
    name: { type: "string", required: true },
    params: { type: { kind: "array", of: "string" }, default: [] },
    body: { type: "expr", required: true },
  },
  children: { allowed: false },
};

const effect: AtomDef = {
  kind: "effect",
  category: "logic",
  docs: "Side effect that runs when `deps` change.",
  props: {
    body: { type: "expr", required: true },
    deps: { type: { kind: "array", of: "string" }, default: [] },
  },
  children: { allowed: false },
};

const derive: AtomDef = {
  kind: "derive",
  category: "logic",
  docs: "Computed value derived from other state.",
  props: {
    name: { type: "string", required: true },
    from: { type: "expr", required: true },
  },
  children: { allowed: false },
};

export const LOGIC_ATOMS: AtomDef[] = [when, repeat, match, bind, state, action, effect, derive];
