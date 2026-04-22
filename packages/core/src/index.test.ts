import { describe, it, expect } from "vitest";
import { loadAtoms } from "./atoms/index.js";
import { Registry } from "./registry.js";
import { validateManifest, hasErrors } from "./validate.js";
import { expand } from "./expand.js";
import type { Manifest, IRNode, AtomDef, CompoundDef } from "./ir.js";

describe("atoms", () => {
  it("ships exactly 60 atoms", () => {
    expect(loadAtoms()).toHaveLength(60);
  });

  it("every atom has a unique kind", () => {
    const kinds = loadAtoms().map((a) => a.kind);
    expect(new Set(kinds).size).toBe(kinds.length);
  });

  it("every atom has a category and docs", () => {
    for (const a of loadAtoms()) {
      expect(a.category).toBeTruthy();
      expect(a.docs.length).toBeGreaterThan(0);
    }
  });
});

describe("Registry", () => {
  it("rejects duplicate kind", () => {
    const r = new Registry();
    const def: AtomDef = { kind: "dup", category: "layout", docs: "x", props: {} };
    r.registerAtom(def);
    expect(() => r.registerAtom(def)).toThrow();
  });

  it("distinguishes atoms and compounds", () => {
    const r = new Registry();
    r.registerAtom({ kind: "a", category: "layout", docs: "", props: {} });
    const comp: CompoundDef = {
      kind: "c", category: "ui", docs: "", props: {}, body: [], source: "test",
    };
    r.registerCompound(comp);
    expect(r.isAtom("a")).toBe(true);
    expect(r.isCompound("c")).toBe(true);
    expect(r.isAtom("c")).toBe(false);
  });
});

describe("validate", () => {
  it("reports unknown kinds", () => {
    const r = new Registry();
    for (const a of loadAtoms()) r.registerAtom(a);
    const m: Manifest = {
      target: "web", adapter: "next", project: { name: "t" },
      nodes: [{ kind: "no-such-atom", props: {}, children: [] }],
    };
    const diags = validateManifest(m, r);
    expect(hasErrors(diags)).toBe(true);
  });

  it("accepts a valid manifest", () => {
    const r = new Registry();
    for (const a of loadAtoms()) r.registerAtom(a);
    const m: Manifest = {
      target: "web", adapter: "next", project: { name: "t" },
      nodes: [{ kind: "text", props: { value: "hi" }, children: [] }],
    };
    const diags = validateManifest(m, r);
    expect(hasErrors(diags)).toBe(false);
  });

  it("rejects missing required prop", () => {
    const r = new Registry();
    for (const a of loadAtoms()) r.registerAtom(a);
    const m: Manifest = {
      target: "web", adapter: "next", project: { name: "t" },
      nodes: [{ kind: "text", props: {}, children: [] }],
    };
    const diags = validateManifest(m, r);
    expect(hasErrors(diags)).toBe(true);
  });
});

describe("expand", () => {
  it("passes atoms through unchanged", () => {
    const r = new Registry();
    for (const a of loadAtoms()) r.registerAtom(a);
    const nodes: IRNode[] = [{ kind: "text", props: { value: "hi" }, children: [] }];
    const out = expand(nodes, r);
    expect(out).toHaveLength(1);
    expect(out[0].kind).toBe("text");
  });

  it("expands a compound into its atom body", () => {
    const r = new Registry();
    for (const a of loadAtoms()) r.registerAtom(a);
    const comp: CompoundDef = {
      kind: "greet",
      category: "ui",
      docs: "",
      props: { name: { type: "string", required: true } },
      body: [{ kind: "text", props: { value: "Hello {{ props.name }}" }, children: [] }],
      source: "test",
    };
    r.registerCompound(comp);
    const nodes: IRNode[] = [{ kind: "greet", props: { name: "World" }, children: [] }];
    const out = expand(nodes, r);
    expect(out).toHaveLength(1);
    expect(out[0].kind).toBe("text");
    expect(out[0].props.value).toBe("Hello World");
  });

  it("injects slot children into compound body", () => {
    const r = new Registry();
    for (const a of loadAtoms()) r.registerAtom(a);
    const wrapper: CompoundDef = {
      kind: "wrap",
      category: "ui",
      docs: "",
      props: {},
      body: [{
        kind: "box",
        props: { padding: 8 },
        children: [{ kind: "slot", props: {}, children: [] }],
      }],
      source: "test",
    };
    r.registerCompound(wrapper);
    const nodes: IRNode[] = [
      {
        kind: "wrap",
        props: {},
        children: [{ kind: "text", props: { value: "inside" }, children: [] }],
      },
    ];
    const out = expand(nodes, r);
    expect(out).toHaveLength(1);
    expect(out[0].kind).toBe("box");
    expect(out[0].children).toHaveLength(1);
    expect(out[0].children[0].kind).toBe("text");
  });

  it("detects infinite recursion", () => {
    const r = new Registry();
    for (const a of loadAtoms()) r.registerAtom(a);
    const loop: CompoundDef = {
      kind: "loop",
      category: "ui",
      docs: "",
      props: {},
      body: [{ kind: "loop", props: {}, children: [] }],
      source: "test",
    };
    r.registerCompound(loop);
    expect(() => expand([{ kind: "loop", props: {}, children: [] }], r)).toThrow(/max depth/);
  });
});
