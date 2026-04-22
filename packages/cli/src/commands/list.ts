import { loadAtoms, buildRegistry } from "@glyph/core";
import { loadProjectRegistry } from "../registry.js";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export async function listCommand(argv: string[]): Promise<void> {
  const showAtoms = !argv.includes("--compounds");
  const showCompounds = !argv.includes("--atoms");
  const catIdx = argv.indexOf("--category");
  const category = catIdx >= 0 ? argv[catIdx + 1] : undefined;

  const hasManifest = existsSync(resolve(process.cwd(), "project.glyph"));
  const registry = hasManifest
    ? await loadProjectRegistry(process.cwd())
    : await buildRegistry({ atoms: loadAtoms() });

  const atoms = showAtoms ? registry.listAtoms() : [];
  const compounds = showCompounds ? registry.listCompounds() : [];

  const byCat: Record<string, { atoms: string[]; compounds: string[] }> = {};
  for (const a of atoms) {
    if (category && a.category !== category) continue;
    (byCat[a.category] ??= { atoms: [], compounds: [] }).atoms.push(a.kind);
  }
  for (const c of compounds) {
    if (category && c.category !== category) continue;
    (byCat[c.category] ??= { atoms: [], compounds: [] }).compounds.push(c.kind);
  }

  const cats = Object.keys(byCat).sort();
  for (const cat of cats) {
    const { atoms, compounds } = byCat[cat];
    console.log(`\n## ${cat}`);
    if (atoms.length > 0) console.log(`  atoms:     ${atoms.sort().join(", ")}`);
    if (compounds.length > 0) console.log(`  compounds: ${compounds.sort().join(", ")}`);
  }
  const total =
    atoms.length + compounds.length;
  console.log(`\nTotal: ${atoms.length} atom(s) + ${compounds.length} compound(s) = ${total}`);
}
