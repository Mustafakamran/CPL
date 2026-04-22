import { validateManifest, hasErrors } from "@glyph/core";
import { loadManifest } from "../manifest.js";
import { loadProjectRegistry } from "../registry.js";
import { getAdapter } from "../adapters.js";
import { dirname } from "node:path";

export async function doctorCommand(_argv: string[]): Promise<void> {
  const { path, manifest } = await loadManifest();
  console.log(`Manifest: ${path}`);
  console.log(`Target: ${manifest.target}`);
  console.log(`Adapter: ${manifest.adapter}`);

  let ok = true;
  try {
    const adapter = getAdapter(manifest.adapter);
    if (!adapter.supportedTargets.includes(manifest.target)) {
      console.error(`  ERROR: adapter '${adapter.id}' does not support target '${manifest.target}'`);
      ok = false;
    } else {
      console.log(`  OK: adapter supports target`);
    }
  } catch (e) {
    console.error(`  ERROR: ${(e as Error).message}`);
    ok = false;
  }

  const registry = await loadProjectRegistry(dirname(path));
  console.log(`\nVocabulary: ${registry.listAtoms().length} atoms, ${registry.listCompounds().length} compounds`);

  const diags = validateManifest(manifest, registry);
  if (diags.length === 0) {
    console.log(`\nManifest: clean (${manifest.nodes.length} top-level node(s))`);
  } else {
    console.log(`\nManifest diagnostics:`);
    for (const d of diags) {
      console.log(`  ${d.severity.toUpperCase()}: ${d.message} (at ${d.path ?? "?"})`);
    }
    if (hasErrors(diags)) ok = false;
  }

  if (!ok) process.exit(1);
}
