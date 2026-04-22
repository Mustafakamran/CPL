import type { IRNode, Manifest, Diagnostic, PropSchema, PropValue, PropType } from "./ir.js";
import type { Registry } from "./registry.js";

function typeMatch(t: PropType, v: PropValue): boolean {
  if (t === "any" || t === "expr") return true;
  if (t === "string") return typeof v === "string";
  if (t === "number") return typeof v === "number";
  if (t === "boolean") return typeof v === "boolean";
  if (typeof t === "object") {
    if (t.kind === "enum") return typeof v === "string" && t.values.includes(v);
    if (t.kind === "array") return Array.isArray(v) && v.every((x) => typeMatch(t.of, x as PropValue));
    if (t.kind === "object") {
      if (!v || typeof v !== "object" || Array.isArray(v)) return false;
      for (const [k, st] of Object.entries(t.shape)) {
        if (!typeMatch(st, (v as Record<string, PropValue>)[k])) return false;
      }
      return true;
    }
  }
  return false;
}

function validateProps(
  kind: string,
  props: Record<string, PropValue>,
  schema: Record<string, PropSchema>,
  path: string,
  diags: Diagnostic[]
): void {
  for (const [k, s] of Object.entries(schema)) {
    const v = props[k];
    if (v === undefined) {
      if (s.required && s.default === undefined) {
        diags.push({ severity: "error", message: `Missing required prop '${k}' on ${kind}`, path });
      }
      continue;
    }
    if (!typeMatch(s.type, v)) {
      diags.push({
        severity: "error",
        message: `Prop '${k}' on ${kind} has wrong type`,
        path,
      });
    }
  }
  for (const k of Object.keys(props)) {
    if (!(k in schema)) {
      diags.push({ severity: "warning", message: `Unknown prop '${k}' on ${kind}`, path });
    }
  }
}

function validateNode(node: IRNode, registry: Registry, path: string, diags: Diagnostic[]): void {
  const def = registry.get(node.kind);
  if (!def) {
    diags.push({ severity: "error", message: `Unknown primitive kind '${node.kind}'`, path });
    return;
  }
  validateProps(node.kind, node.props, def.props, path, diags);
  const childRule = def.children;
  if (childRule && !childRule.allowed && node.children.length > 0) {
    diags.push({
      severity: "error",
      message: `${node.kind} does not allow children`,
      path,
    });
  }
  node.children.forEach((c, i) =>
    validateNode(c, registry, `${path}.children[${i}]`, diags)
  );
}

export function validateManifest(manifest: Manifest, registry: Registry): Diagnostic[] {
  const diags: Diagnostic[] = [];
  manifest.nodes.forEach((n, i) => validateNode(n, registry, `nodes[${i}]`, diags));
  return diags;
}

export function hasErrors(diags: Diagnostic[]): boolean {
  return diags.some((d) => d.severity === "error");
}
