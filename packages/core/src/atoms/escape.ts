import type { AtomDef } from "../ir.js";

const native: AtomDef = {
  kind: "native",
  category: "escape",
  docs: "Raw per-adapter source. Provide a string keyed by adapter id. The adapter's own string is emitted verbatim; others get a no-op.",
  props: {
    code: { type: "any", required: true, docs: "{ next: '...', compose: '...', flutter: '...', tauri: '...' }" },
  },
  children: { allowed: false },
};

export const ESCAPE_ATOMS: AtomDef[] = [native];
