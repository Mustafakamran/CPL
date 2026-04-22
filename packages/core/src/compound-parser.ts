import YAML from "yaml";
import type { CompoundDef, IRNode, PropSchema, PrimitiveCategory } from "./ir.js";

interface RawCompound {
  kind: string;
  category: PrimitiveCategory;
  docs?: string;
  props?: Record<string, PropSchema>;
  children?: { allowed: boolean; min?: number; max?: number };
  body: unknown;
}

function parseNode(raw: unknown, path: string): IRNode {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`Invalid node at ${path}: expected object`);
  }
  const obj = raw as Record<string, unknown>;
  const kind = obj.kind;
  if (typeof kind !== "string") {
    throw new Error(`Invalid node at ${path}: missing 'kind'`);
  }
  const props = (obj.props ?? {}) as IRNode["props"];
  if (typeof props !== "object" || Array.isArray(props)) {
    throw new Error(`Invalid props at ${path}`);
  }
  const childrenRaw = obj.children ?? [];
  if (!Array.isArray(childrenRaw)) {
    throw new Error(`Invalid children at ${path}: expected array`);
  }
  const children = childrenRaw.map((c, i) => parseNode(c, `${path}.children[${i}]`));
  const name = typeof obj.name === "string" ? obj.name : undefined;
  return { kind, name, props, children };
}

export function parseCompound(source: string, filePath: string): CompoundDef {
  const raw = YAML.parse(source) as RawCompound;
  if (!raw || typeof raw !== "object") {
    throw new Error(`Invalid compound file ${filePath}: not an object`);
  }
  if (typeof raw.kind !== "string") {
    throw new Error(`Invalid compound ${filePath}: missing 'kind'`);
  }
  if (typeof raw.category !== "string") {
    throw new Error(`Invalid compound ${filePath}: missing 'category'`);
  }
  const bodyRaw = raw.body;
  const bodyNodes = Array.isArray(bodyRaw) ? bodyRaw : [bodyRaw];
  const body = bodyNodes.map((n, i) => parseNode(n, `${raw.kind}.body[${i}]`));
  return {
    kind: raw.kind,
    category: raw.category,
    docs: raw.docs ?? "",
    props: raw.props ?? {},
    children: raw.children,
    body,
    source: filePath,
  };
}
