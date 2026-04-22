import { describe, it, expect } from "vitest";
import { loadAtoms } from "@glyph/core";
import type { IRNode, EmitContext } from "@glyph/core";
import nextAdapter from "./index.js";

const ctx: EmitContext = {
  target: "web",
  project: { name: "test" },
  emitChildren: async () => "",
  unique: (p) => `${p}_0`,
};

function sampleNode(kind: string): IRNode {
  const atom = loadAtoms().find((a) => a.kind === kind)!;
  const props: Record<string, unknown> = {};
  for (const [k, s] of Object.entries(atom.props)) {
    if (s.required) {
      if (s.type === "string") props[k] = "x";
      else if (s.type === "number") props[k] = 1;
      else if (s.type === "boolean") props[k] = false;
      else if (s.type === "expr" || s.type === "any") props[k] = "stub";
      else if (typeof s.type === "object" && s.type.kind === "enum") props[k] = s.type.values[0];
      else if (typeof s.type === "object" && s.type.kind === "array") props[k] = [];
      else props[k] = null;
    }
  }
  return { kind, props: props as IRNode["props"], children: [] };
}

describe("adapter-next contract", () => {
  const atoms = loadAtoms();

  it("scaffolds a working project skeleton", async () => {
    const files = await nextAdapter.scaffold({ project: { name: "t" }, target: "web" });
    expect(files["package.json"]).toBeTruthy();
    expect(files["src/app/page.tsx"]).toContain("__GLYPH_EMITTED_NODES__");
  });

  // Atoms that are legitimately no-ops on web (marker / runtime-only):
  const noopAtoms = new Set(["bind", "haptic", "native", "router", "route", "app"]);

  for (const atom of atoms) {
    it(`emits for atom '${atom.kind}' without throwing`, async () => {
      const res = await nextAdapter.emitAtom(sampleNode(atom.kind), ctx);
      expect(res.snippet).toBeDefined();
      if (!noopAtoms.has(atom.kind)) {
        expect(res.snippet!.length).toBeGreaterThan(0);
      }
    });
  }
});
