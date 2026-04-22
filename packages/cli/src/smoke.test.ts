import { describe, it, expect } from "vitest";
import { BUILTIN_ADAPTERS, getAdapter, adaptersForTarget } from "./adapters.js";

describe("cli adapter registry", () => {
  it("ships four built-in adapters", () => {
    expect(BUILTIN_ADAPTERS.map((a) => a.id).sort()).toEqual(
      ["compose", "flutter", "next", "tauri"]
    );
  });

  it("resolves adapter by id", () => {
    expect(getAdapter("next").id).toBe("next");
  });

  it("throws on unknown adapter", () => {
    expect(() => getAdapter("nope")).toThrow(/Unknown adapter/);
  });

  it("filters adapters by target", () => {
    const webAdapters = adaptersForTarget("web").map((a) => a.id);
    expect(webAdapters).toContain("next");
    expect(webAdapters).toContain("flutter");
    expect(webAdapters).not.toContain("compose");
  });
});
