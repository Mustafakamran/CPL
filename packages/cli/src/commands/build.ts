import { resolve, dirname, join } from "node:path";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { validateManifest, hasErrors, expand, type FileMap, type IRNode, type EmitContext } from "@glyph/core";
import { loadManifest } from "../manifest.js";
import { loadProjectRegistry } from "../registry.js";
import { getAdapter } from "../adapters.js";

export async function buildCommand(argv: string[]): Promise<void> {
  const outIdx = argv.indexOf("--out");
  const out = outIdx >= 0 ? resolve(process.cwd(), argv[outIdx + 1]) : resolve(process.cwd(), "out");

  const { path, manifest } = await loadManifest();
  const projectDir = dirname(path);
  const registry = await loadProjectRegistry(projectDir);
  const adapter = getAdapter(manifest.adapter);

  if (!adapter.supportedTargets.includes(manifest.target)) {
    throw new Error(`Adapter '${adapter.id}' does not support target '${manifest.target}'`);
  }

  const diags = validateManifest(manifest, registry);
  for (const d of diags) {
    const tag = d.severity === "error" ? "ERROR" : "WARN";
    console.log(`${tag}: ${d.message} (at ${d.path ?? "?"})`);
  }
  if (hasErrors(diags)) throw new Error("Manifest has errors; aborting build");

  const overrideKinds = new Set<string>();
  if (adapter.overrideFor) {
    for (const c of registry.listCompounds()) {
      if (adapter.overrideFor(c.kind)) overrideKinds.add(c.kind);
    }
  }
  const expanded = expand(manifest.nodes, registry, overrideKinds);

  let counter = 0;
  const ctx: EmitContext = {
    target: manifest.target,
    project: manifest.project,
    emitChildren: async (nodes) => emitChildrenFn(nodes, adapter, registry, overrideKinds, ctx),
    unique: (prefix) => `${prefix}_${++counter}`,
  };

  const scaffold = await adapter.scaffold({ project: manifest.project, target: manifest.target });
  const files: FileMap = { ...scaffold };
  const snippets: string[] = [];
  for (const node of expanded) {
    const res = await emitNode(node, adapter, registry, overrideKinds, ctx);
    Object.assign(files, res.files);
    if (res.snippet) snippets.push(res.snippet);
  }

  if (snippets.length > 0) {
    const marker = "__GLYPH_EMITTED_NODES__";
    for (const [p, content] of Object.entries(files)) {
      if (content.includes(marker)) {
        files[p] = content.replace(marker, snippets.join("\n"));
      }
    }
  }

  const finalFiles = adapter.postBuild ? await adapter.postBuild(files, { target: manifest.target }) : files;

  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  let fileCount = 0;
  for (const [rel, content] of Object.entries(finalFiles)) {
    const p = join(out, rel);
    await mkdir(dirname(p), { recursive: true });
    await writeFile(p, content, "utf8");
    fileCount++;
  }
  console.log(`Built ${fileCount} file(s) into ${out}`);
}

async function emitNode(
  node: IRNode,
  adapter: ReturnType<typeof getAdapter>,
  registry: Awaited<ReturnType<typeof loadProjectRegistry>>,
  overrides: Set<string>,
  ctx: EmitContext
) {
  const def = registry.get(node.kind);
  if (def?.type === "compound" && adapter.overrideFor) {
    const override = adapter.overrideFor(node.kind);
    if (override) return override(node, ctx);
  }
  return adapter.emitAtom(node, ctx);
}

async function emitChildrenFn(
  nodes: IRNode[],
  adapter: ReturnType<typeof getAdapter>,
  registry: Awaited<ReturnType<typeof loadProjectRegistry>>,
  overrides: Set<string>,
  ctx: EmitContext
): Promise<string> {
  const parts: string[] = [];
  for (const n of nodes) {
    const r = await emitNode(n, adapter, registry, overrides, ctx);
    if (r.snippet) parts.push(r.snippet);
  }
  return parts.join("\n");
}
