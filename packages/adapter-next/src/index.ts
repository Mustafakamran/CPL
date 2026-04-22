import type { Adapter, IRNode, EmitContext, EmitResult, PropValue } from "@glyph/core";
import { scaffoldFiles } from "./scaffold.js";
import { emit, ATOM_KINDS } from "./emit.js";
import { escape, escapeAttr, isExpr, stripExpr } from "./emit-helpers.js";

function s(v: PropValue, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

function maybeExpr(v: PropValue): string | null {
  if (typeof v === "string" && isExpr(v)) return stripExpr(v);
  return null;
}

function propContent(v: PropValue, fallback = ""): string {
  const e = maybeExpr(v);
  if (e) return `{${e}}`;
  return escape(s(v, fallback));
}

type Emitter = (node: IRNode, ctx: EmitContext) => Promise<EmitResult>;

const COMPOUND_OVERRIDES: Record<string, Emitter> = {
  async card(node, ctx) {
    const inner = await ctx.emitChildren(node.children);
    return { files: {}, snippet: `<Card><CardContent className="p-6">${inner}</CardContent></Card>` };
  },

  async alert(node) {
    const variant = s(node.props.variant, "info");
    const shadcnVariant =
      variant === "danger" ? "destructive"
      : variant === "warning" ? "warning"
      : variant === "success" ? "success"
      : "info";
    const title = node.props.title
      ? `<AlertTitle>${propContent(node.props.title)}</AlertTitle>`
      : "";
    const msg = `<AlertDescription>${propContent(node.props.message)}</AlertDescription>`;
    return { files: {}, snippet: `<Alert variant="${shadcnVariant}">${title}${msg}</Alert>` };
  },

  async badge(node) {
    const variant = s(node.props.variant, "neutral");
    const shadcnVariant =
      variant === "danger" ? "destructive"
      : variant === "warning" ? "outline"
      : variant === "success" ? "default"
      : "secondary";
    return { files: {}, snippet: `<Badge variant="${shadcnVariant}">${propContent(node.props.label)}</Badge>` };
  },

  async chip(node) {
    const onRemove = maybeExpr(node.props.onRemove);
    const removeBtn = onRemove
      ? `<button type="button" onClick={() => { ${onRemove} }} className="ml-1 -mr-1 rounded-sm hover:bg-muted-foreground/20 px-1" aria-label="Remove">×</button>`
      : "";
    return { files: {}, snippet: `<Badge variant="secondary" className="gap-1">${propContent(node.props.label)}${removeBtn}</Badge>` };
  },

  async skeleton(node) {
    const w = node.props.width ?? "100%";
    const h = node.props.height ?? 16;
    const style = `width: ${JSON.stringify(typeof w === "number" ? `${w}px` : String(w))}, height: ${JSON.stringify(typeof h === "number" ? `${h}px` : String(h))}`;
    return { files: {}, snippet: `<Skeleton style={{ ${style} }} />` };
  },

  async avatar(node) {
    const size = typeof node.props.size === "number" ? node.props.size : 40;
    const src = node.props.src;
    const name = s(node.props.name);
    const initial = name ? name.charAt(0).toUpperCase() : "?";
    const sizeStyle = `style={{ width: ${size}, height: ${size} }}`;
    const image = src ? `<AvatarImage src="${escapeAttr(s(src))}" alt="${escapeAttr(name)}" />` : "";
    return { files: {}, snippet: `<Avatar ${sizeStyle}>${image}<AvatarFallback>${escape(initial)}</AvatarFallback></Avatar>` };
  },
};

const nextAdapter: Adapter = {
  id: "next",
  supportedTargets: ["web"],
  async scaffold({ project }) {
    return scaffoldFiles({ name: project.name });
  },
  emitAtom: emit,
  overrideFor(kind) {
    return COMPOUND_OVERRIDES[kind];
  },
};

export default nextAdapter;
export { ATOM_KINDS };
