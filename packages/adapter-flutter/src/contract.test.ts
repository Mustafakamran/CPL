import { describe, it, expect } from "vitest";
import { loadAtoms } from "@cpl/core";
import type { IRNode, EmitContext } from "@cpl/core";
import flutterAdapter from "./index.js";

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

describe("adapter-flutter contract", () => {
  it("has an emitter for every atom", async () => {
    for (const atom of loadAtoms()) {
      const res = await flutterAdapter.emitAtom(sampleNode(atom.kind), ctx);
      expect(res.snippet).toBeDefined();
    }
  });

  it("scaffolds pubspec + main.dart", async () => {
    const files = await flutterAdapter.scaffold({ project: { name: "t" }, target: "android" });
    expect(files["pubspec.yaml"]).toBeTruthy();
    expect(files["lib/main.dart"]).toBeTruthy();
  });
});
