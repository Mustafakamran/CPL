import type { IRNode, PropValue } from "@cpl/core";
import { loadManifest, saveManifest, findNodeByName } from "../manifest.js";
import { loadProjectRegistry } from "../registry.js";

interface AddArgs {
  kind: string;
  name?: string;
  parent?: string;
  props: Record<string, PropValue>;
}

function parseArgs(argv: string[]): AddArgs {
  const [kind, ...rest] = argv;
  if (!kind) throw new Error("Usage: cpl add <kind> [--name N] [--parent N] [--prop k=v ...]");
  const args: AddArgs = { kind, props: {} };
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--name") args.name = rest[++i];
    else if (a === "--parent") args.parent = rest[++i];
    else if (a === "--prop") {
      const kv = rest[++i];
      const eq = kv.indexOf("=");
      if (eq === -1) throw new Error(`Bad --prop: ${kv}`);
      const k = kv.slice(0, eq);
      const v = kv.slice(eq + 1);
      args.props[k] = parsePropValue(v);
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  return args;
}

function parsePropValue(raw: string): PropValue {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  if ((raw.startsWith("[") && raw.endsWith("]")) || (raw.startsWith("{") && raw.endsWith("}"))) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

export async function addCommand(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  const { path, manifest } = await loadManifest();
  const registry = await loadProjectRegistry(path.replace(/\/project\.cpl$/, ""));
  const def = registry.get(args.kind);
  if (!def) {
    const known = registry.listAll().map((p) => p.kind).sort().slice(0, 20).join(", ");
    throw new Error(`Unknown primitive kind '${args.kind}'. Some known kinds: ${known} ...`);
  }
  const node: IRNode = { kind: args.kind, name: args.name, props: args.props, children: [] };
  if (args.parent) {
    const parent = findNodeByName(manifest.nodes, args.parent);
    if (!parent) throw new Error(`No node named '${args.parent}' found`);
    parent.children.push(node);
  } else {
    manifest.nodes.push(node);
  }
  await saveManifest(path, manifest);
  const label = args.name ? `${args.kind} '${args.name}'` : args.kind;
  console.log(`Added ${label}${args.parent ? ` under '${args.parent}'` : ""} to ${path}`);
}
