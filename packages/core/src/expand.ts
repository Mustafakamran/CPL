import type { IRNode, PropValue } from "./ir.js";
import type { Registry } from "./registry.js";

function substituteProp(value: PropValue, props: Record<string, PropValue>): PropValue | undefined {
  if (typeof value === "string") {
    const m = value.match(/^\{\{\s*props\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}$/);
    if (m) {
      const v = props[m[1]];
      return v === undefined ? undefined : v;
    }
    return value.replace(/\{\{\s*props\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, (_, k) => {
      const v = props[k];
      return v === undefined || v === null ? "" : String(v);
    });
  }
  if (Array.isArray(value)) return value.map((v) => substituteProp(v, props) ?? null);
  if (value && typeof value === "object") {
    const out: Record<string, PropValue> = {};
    for (const [k, v] of Object.entries(value)) {
      const sub = substituteProp(v, props);
      if (sub !== undefined) out[k] = sub;
    }
    return out;
  }
  return value;
}

function substituteNode(node: IRNode, props: Record<string, PropValue>): IRNode {
  const newProps: Record<string, PropValue> = {};
  for (const [k, v] of Object.entries(node.props)) {
    const sub = substituteProp(v, props);
    if (sub !== undefined) newProps[k] = sub;
  }
  return {
    kind: node.kind,
    name: node.name,
    props: newProps,
    children: node.children.map((c) => substituteNode(c, props)),
  };
}

function applyDefaults(
  providedProps: Record<string, PropValue>,
  schema: Record<string, { default?: PropValue }>
): Record<string, PropValue> {
  const out: Record<string, PropValue> = { ...providedProps };
  for (const [k, s] of Object.entries(schema)) {
    if (out[k] === undefined && s.default !== undefined) out[k] = s.default;
  }
  return out;
}

function injectSlot(nodes: IRNode[], slot: IRNode[]): IRNode[] {
  const out: IRNode[] = [];
  for (const node of nodes) {
    if (node.kind === "slot") {
      out.push(...slot);
      continue;
    }
    out.push({ ...node, children: injectSlot(node.children, slot) });
  }
  return out;
}

export function expand(
  nodes: IRNode[],
  registry: Registry,
  overrideCompounds?: Set<string>,
  depth = 0
): IRNode[] {
  if (depth > 64) {
    throw new Error("Compound expansion exceeded max depth (possible cycle)");
  }
  const out: IRNode[] = [];
  for (const node of nodes) {
    const def = registry.get(node.kind);
    if (!def || def.type === "atom" || overrideCompounds?.has(node.kind)) {
      out.push({ ...node, children: expand(node.children, registry, overrideCompounds, depth + 1) });
      continue;
    }
    const filledProps = applyDefaults(node.props, def.props);
    const substituted = def.body.map((b) => substituteNode(b, filledProps));
    const withChildren = injectSlot(substituted, node.children);
    out.push(...expand(withChildren, registry, overrideCompounds, depth + 1));
  }
  return out;
}
