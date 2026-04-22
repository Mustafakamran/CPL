import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { existsSync } from "node:fs";
import YAML from "yaml";
import type { Manifest, IRNode, Target } from "@glyph/core";

export const MANIFEST_FILE = "project.glyph";

export async function loadManifest(cwd = process.cwd()): Promise<{ path: string; manifest: Manifest }> {
  let dir = cwd;
  while (true) {
    const p = resolve(dir, MANIFEST_FILE);
    if (existsSync(p)) {
      const src = await readFile(p, "utf8");
      const manifest = YAML.parse(src) as Manifest;
      normalizeManifest(manifest);
      return { path: p, manifest };
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`No ${MANIFEST_FILE} found in ${cwd} or any ancestor`);
}

function normalizeManifest(m: Manifest): void {
  m.nodes ??= [];
  for (const n of m.nodes) normalizeNode(n);
}

function normalizeNode(n: IRNode): void {
  n.props ??= {};
  n.children ??= [];
  for (const c of n.children) normalizeNode(c);
}

export async function saveManifest(path: string, manifest: Manifest): Promise<void> {
  const yaml = YAML.stringify(manifest, { lineWidth: 0 });
  await writeFile(path, yaml, "utf8");
}

export function newManifest(opts: { name: string; target: Target; adapter: string }): Manifest {
  return {
    target: opts.target,
    adapter: opts.adapter,
    project: { name: opts.name },
    nodes: [],
  };
}

export function findNodeByName(nodes: IRNode[], name: string): IRNode | undefined {
  for (const n of nodes) {
    if (n.name === name) return n;
    const found = findNodeByName(n.children, name);
    if (found) return found;
  }
  return undefined;
}
