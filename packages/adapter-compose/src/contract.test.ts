import { describe, it, expect } from "vitest";
import { loadAtoms } from "@cpl/core";
import type { IRNode, EmitContext } from "@cpl/core";
import composeAdapter from "./index.js";

const ctx: EmitContext = {
  target: "android",
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

describe("adapter-compose contract", () => {
  it("has an emitter for every atom", async () => {
    for (const atom of loadAtoms()) {
      const res = await composeAdapter.emitAtom(sampleNode(atom.kind), ctx);
      expect(res.snippet).toBeDefined();
    }
  });

  it("has overrides for floating-action-button and action-sheet", () => {
    expect(composeAdapter.overrideFor?.("floating-action-button")).toBeDefined();
    expect(composeAdapter.overrideFor?.("action-sheet")).toBeDefined();
  });

  it("scaffolds Gradle + Compose entry files", async () => {
    const files = await composeAdapter.scaffold({ project: { name: "t" }, target: "android" });
    expect(files["settings.gradle.kts"]).toBeTruthy();
    expect(files["app/build.gradle.kts"]).toBeTruthy();
  });
});
