import { createInterface } from "node:readline/promises";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { writeFile, mkdir } from "node:fs/promises";
import type { Target } from "@glyph/core";
import { newManifest, MANIFEST_FILE } from "../manifest.js";
import { BUILTIN_ADAPTERS, adaptersForTarget } from "../adapters.js";

const TARGETS: Target[] = ["web", "android", "desktop-mac", "desktop-win", "desktop-linux"];

export async function initCommand(argv: string[]): Promise<void> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const name = await rl.question("Project name: ");
    if (!name.trim()) throw new Error("Project name is required");

    console.log("\nTargets:");
    TARGETS.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
    const tIdx = Number(await rl.question("Target [1]: ")) || 1;
    const target = TARGETS[tIdx - 1];
    if (!target) throw new Error("Invalid target");

    const candidates = adaptersForTarget(target);
    if (candidates.length === 0) {
      throw new Error(`No adapters support target '${target}'`);
    }
    console.log(`\nAdapters supporting ${target}:`);
    candidates.forEach((a, i) => console.log(`  ${i + 1}. ${a.id}`));
    const aIdx = Number(await rl.question(`Adapter [1]: `)) || 1;
    const adapter = candidates[aIdx - 1];
    if (!adapter) throw new Error("Invalid adapter");

    const dir = resolve(process.cwd(), name.trim());
    if (existsSync(dir)) throw new Error(`Directory already exists: ${dir}`);
    await mkdir(dir, { recursive: true });

    const manifest = newManifest({ name: name.trim(), target, adapter: adapter.id });
    const path = resolve(dir, MANIFEST_FILE);
    const YAML = (await import("yaml")).default;
    await writeFile(path, YAML.stringify(manifest, { lineWidth: 0 }), "utf8");

    console.log(`\nCreated ${path}`);
    console.log(`Next: cd ${name.trim()} && glyph add page --prop title='Home'`);
  } finally {
    rl.close();
  }
}
