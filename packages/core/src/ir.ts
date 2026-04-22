export type Target =
  | "web"
  | "android"
  | "ios"
  | "desktop-mac"
  | "desktop-win"
  | "desktop-linux";

export type PropValue = string | number | boolean | null | PropValue[] | { [k: string]: PropValue };

export type PropType =
  | "string"
  | "number"
  | "boolean"
  | "any"
  | "expr"
  | { kind: "enum"; values: string[] }
  | { kind: "array"; of: PropType }
  | { kind: "object"; shape: Record<string, PropType> };

export interface PropSchema {
  type: PropType;
  default?: PropValue;
  required?: boolean;
  docs?: string;
}

export interface IRNode {
  kind: string;
  name?: string;
  props: Record<string, PropValue>;
  children: IRNode[];
}

export interface Manifest {
  target: Target;
  adapter: string;
  project: { name: string };
  nodes: IRNode[];
}

export type PrimitiveCategory =
  | "layout"
  | "text"
  | "media"
  | "input"
  | "action"
  | "structural"
  | "logic"
  | "style"
  | "gesture"
  | "escape"
  | "ui"
  | "navigation"
  | "form"
  | "data-display"
  | "data-viz"
  | "typography"
  | "social"
  | "commerce"
  | "mobile"
  | "settings"
  | "overlay"
  | "auth"
  | "integration";

export interface AtomDef {
  kind: string;
  category: PrimitiveCategory;
  props: Record<string, PropSchema>;
  children?: { allowed: boolean; only?: string[]; min?: number; max?: number };
  docs: string;
}

export interface CompoundDef {
  kind: string;
  category: PrimitiveCategory;
  props: Record<string, PropSchema>;
  children?: { allowed: boolean; min?: number; max?: number };
  docs: string;
  body: IRNode[];
  source: string;
}

export type PrimitiveDef =
  | ({ type: "atom" } & AtomDef)
  | ({ type: "compound" } & CompoundDef);

export interface Diagnostic {
  severity: "error" | "warning";
  message: string;
  path?: string;
}

export interface EmitResult {
  files: Record<string, string>;
  snippet?: string;
  imports?: string[];
}

export type FileMap = Record<string, string>;
