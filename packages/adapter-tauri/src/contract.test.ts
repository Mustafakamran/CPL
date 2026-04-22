import { describe, it, expect } from "vitest";
import tauriAdapter from "./index.js";

describe("adapter-tauri contract", () => {
  it("supports all three desktop targets", () => {
    expect(tauriAdapter.supportedTargets).toEqual(
      expect.arrayContaining(["desktop-mac", "desktop-win", "desktop-linux"])
    );
  });

  it("scaffolds the web project plus a Tauri Rust shell", async () => {
    const files = await tauriAdapter.scaffold({ project: { name: "t" }, target: "desktop-mac" });
    expect(files["package.json"]).toBeTruthy();
    expect(files["src/app/page.tsx"]).toContain("__GLYPH_EMITTED_NODES__");
    expect(files["src-tauri/tauri.conf.json"]).toBeTruthy();
    expect(files["src-tauri/src/main.rs"]).toContain("tauri::Builder");
  });

  it("delegates atom emission to adapter-next", () => {
    expect(typeof tauriAdapter.emitAtom).toBe("function");
  });
});
