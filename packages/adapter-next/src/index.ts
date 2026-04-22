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

  async modal(node, ctx) {
    const open = maybeExpr(node.props.open) ?? "false";
    const title = node.props.title
      ? `<DialogHeader><DialogTitle>${propContent(node.props.title)}</DialogTitle></DialogHeader>`
      : "";
    const inner = await ctx.emitChildren(node.children);
    return {
      files: {},
      snippet: `<Dialog open={${open}}><DialogContent>${title}${inner}</DialogContent></Dialog>`,
    };
  },

  async tabs(node, ctx) {
    const active = maybeExpr(node.props.active);
    const valueAttr = active ? ` value={${active}}` : "";
    const onChange = maybeExpr(node.props.onChange);
    const onValueChange = onChange ? ` onValueChange={(v) => { ${onChange}; }}` : "";
    const inner = await ctx.emitChildren(node.children);
    return {
      files: {},
      snippet: `<Tabs${valueAttr}${onValueChange}><TabsList>${inner}</TabsList></Tabs>`,
    };
  },

  async tab(node) {
    const label = s(node.props.label);
    return {
      files: {},
      snippet: `<TabsTrigger value="${escapeAttr(label)}">${escape(label)}</TabsTrigger>`,
    };
  },

  async tooltip(node, ctx) {
    const text = propContent(node.props.text);
    const inner = await ctx.emitChildren(node.children);
    return {
      files: {},
      snippet: `<Tooltip><TooltipTrigger asChild>${inner || "<span />"}</TooltipTrigger><TooltipContent>${text}</TooltipContent></Tooltip>`,
    };
  },

  async accordion(node, ctx) {
    const title = propContent(node.props.title);
    const inner = await ctx.emitChildren(node.children);
    const id = ctx.unique("acc");
    return {
      files: {},
      snippet: `<Accordion type="single" collapsible><AccordionItem value="${id}"><AccordionTrigger>${title}</AccordionTrigger><AccordionContent>${inner}</AccordionContent></AccordionItem></Accordion>`,
    };
  },

  async progress(node) {
    const value = maybeExpr(node.props.value) ?? String(node.props.value ?? 0);
    const max = typeof node.props.max === "number" ? node.props.max : 100;
    const pct = max === 100 ? value : `((${value}) * 100 / ${max})`;
    return {
      files: {},
      snippet: `<Progress value={${pct}} />`,
    };
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
