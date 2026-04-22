import type { Emitter, IRNode, EmitContext, PropValue } from "@glyph/core";
import { cssSize, isExpr, stripExpr, propToValue, escape, escapeAttr } from "./emit-helpers.js";

type Emit = (node: IRNode, ctx: EmitContext) => Promise<string>;

async function children(ctx: EmitContext, node: IRNode): Promise<string> {
  return ctx.emitChildren(node.children);
}

function str(v: PropValue, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

function num(v: PropValue, fallback = 0): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && !isExpr(v)) {
    const n = Number(v);
    if (!isNaN(n)) return n;
  }
  return fallback;
}

function maybeExpr(v: PropValue): string | null {
  if (typeof v === "string" && isExpr(v)) return stripExpr(v);
  return null;
}

function styleFromProps(props: Record<string, PropValue>, map: Record<string, keyof Record<string, unknown> | ((v: PropValue) => [string, string] | null)>): string {
  const parts: string[] = [];
  for (const [key, mapTo] of Object.entries(map)) {
    const v = props[key];
    if (v === undefined || v === null) continue;
    if (typeof mapTo === "function") {
      const r = mapTo(v);
      if (r) parts.push(`${JSON.stringify(r[0])}: ${JSON.stringify(r[1])}`);
    } else {
      parts.push(`${JSON.stringify(String(mapTo))}: ${JSON.stringify(cssSize(v))}`);
    }
  }
  return parts.join(", ");
}

const emitters: Record<string, Emit> = {
  // ──────────── LAYOUT ────────────
  async box(node, ctx) {
    const p = node.props;
    const style = styleFromProps(p, {
      padding: "padding",
      margin: "margin",
      background: "background",
      border: "border",
      radius: "borderRadius",
      width: "width",
      height: "height",
    });
    return `<div style={{${style}}}>${await children(ctx, node)}</div>`;
  },
  async stack(node, ctx) {
    const axis = str(node.props.axis, "vertical");
    const flexDirection = axis === "horizontal" ? "row" : "column";
    const style = [
      `display: "flex"`,
      `flexDirection: ${JSON.stringify(flexDirection)}`,
      `gap: ${JSON.stringify(cssSize(node.props.gap))}`,
      `alignItems: ${JSON.stringify(mapAlign(str(node.props.align, "stretch")))}`,
      `justifyContent: ${JSON.stringify(mapJustify(str(node.props.justify, "start")))}`,
      `flexWrap: ${JSON.stringify(node.props.wrap ? "wrap" : "nowrap")}`,
    ].join(", ");
    return `<div style={{${style}}}>${await children(ctx, node)}</div>`;
  },
  async row(node, ctx) {
    const style = [
      `display: "flex"`,
      `flexDirection: "row"`,
      `gap: ${JSON.stringify(cssSize(node.props.gap))}`,
      `alignItems: ${JSON.stringify(mapAlign(str(node.props.align, "center")))}`,
      `justifyContent: ${JSON.stringify(mapJustify(str(node.props.justify, "start")))}`,
    ].join(", ");
    return `<div style={{${style}}}>${await children(ctx, node)}</div>`;
  },
  async column(node, ctx) {
    const style = [
      `display: "flex"`,
      `flexDirection: "column"`,
      `gap: ${JSON.stringify(cssSize(node.props.gap))}`,
      `alignItems: ${JSON.stringify(mapAlign(str(node.props.align, "stretch")))}`,
      `justifyContent: ${JSON.stringify(mapJustify(str(node.props.justify, "start")))}`,
    ].join(", ");
    return `<div style={{${style}}}>${await children(ctx, node)}</div>`;
  },
  async grid(node, ctx) {
    const cols = node.props.columns;
    const rows = node.props.rows;
    const gridTemplateColumns =
      typeof cols === "number" ? `repeat(${cols}, 1fr)` : typeof cols === "string" ? cols : "1fr";
    const gridTemplateRows =
      typeof rows === "number" ? `repeat(${rows}, 1fr)` : typeof rows === "string" ? rows : undefined;
    const style = [
      `display: "grid"`,
      `gridTemplateColumns: ${JSON.stringify(gridTemplateColumns)}`,
      gridTemplateRows ? `gridTemplateRows: ${JSON.stringify(gridTemplateRows)}` : "",
      `gap: ${JSON.stringify(cssSize(node.props.gap))}`,
    ].filter(Boolean).join(", ");
    return `<div style={{${style}}}>${await children(ctx, node)}</div>`;
  },
  async flex(node, ctx) {
    const style = [
      `display: "flex"`,
      `flexDirection: ${JSON.stringify(str(node.props.direction, "row"))}`,
      `gap: ${JSON.stringify(cssSize(node.props.gap))}`,
      `alignItems: ${JSON.stringify(mapAlign(str(node.props.align, "stretch")))}`,
      `justifyContent: ${JSON.stringify(mapJustify(str(node.props.justify, "start")))}`,
      `flexWrap: ${JSON.stringify(node.props.wrap ? "wrap" : "nowrap")}`,
    ].join(", ");
    return `<div style={{${style}}}>${await children(ctx, node)}</div>`;
  },
  async spacer(node) {
    const size = cssSize(node.props.size) || "auto";
    return `<div style={{ flex: ${size === "auto" ? "1" : "undefined"}, width: ${JSON.stringify(size)}, height: ${JSON.stringify(size)} }} />`;
  },
  async divider(node) {
    const orientation = str(node.props.orientation, "horizontal");
    return `<Separator orientation="${orientation}" />`;
  },
  async "scroll-view"(node, ctx) {
    const axis = str(node.props.axis, "vertical");
    const overflow =
      axis === "both" ? "overflow: \"auto\"" : axis === "horizontal" ? "overflowX: \"auto\", overflowY: \"hidden\"" : "overflowY: \"auto\", overflowX: \"hidden\"";
    return `<div style={{ ${overflow}, width: "100%", height: "100%" }}>${await children(ctx, node)}</div>`;
  },
  async "safe-area"(node, ctx) {
    return `<div style={{ padding: "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)" }}>${await children(ctx, node)}</div>`;
  },
  async sticky(node, ctx) {
    const edge = str(node.props.edge, "top");
    const style = `position: "sticky", ${edge}: 0, zIndex: 10`;
    return `<div style={{ ${style} }}>${await children(ctx, node)}</div>`;
  },
  async center(node, ctx) {
    return `<div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>${await children(ctx, node)}</div>`;
  },
  async aspect(node, ctx) {
    const ratio = num(node.props.ratio, 1);
    return `<div style={{ aspectRatio: ${JSON.stringify(String(ratio))}, width: "100%" }}>${await children(ctx, node)}</div>`;
  },
  async portal(node, ctx) {
    return `<div data-glyph-portal>${await children(ctx, node)}</div>`;
  },

  // ──────────── TEXT ────────────
  async text(node) {
    const value = str(node.props.value);
    const expr = maybeExpr(node.props.value);
    const content = expr ? `{${expr}}` : escape(value);
    const style: string[] = [];
    if (node.props.weight) style.push(`fontWeight: ${JSON.stringify(String(node.props.weight))}`);
    if (node.props.size) style.push(`fontSize: ${JSON.stringify(cssSize(node.props.size))}`);
    if (node.props.color) style.push(`color: ${JSON.stringify(String(node.props.color))}`);
    return `<span className="text-sm text-foreground"${style.length ? ` style={{ ${style.join(", ")} }}` : ""}>${content}</span>`;
  },
  async heading(node) {
    const level = str(node.props.level, "1");
    const value = str(node.props.value);
    const expr = maybeExpr(node.props.value);
    const content = expr ? `{${expr}}` : escape(value);
    const sizeClass = level === "1" ? "text-4xl font-bold tracking-tight"
      : level === "2" ? "text-3xl font-semibold tracking-tight"
      : level === "3" ? "text-2xl font-semibold tracking-tight"
      : level === "4" ? "text-xl font-semibold"
      : level === "5" ? "text-lg font-semibold"
      : "text-base font-semibold";
    return `<h${level} className="${sizeClass}">${content}</h${level}>`;
  },
  async paragraph(node) {
    const expr = maybeExpr(node.props.value);
    return `<p className="leading-7 text-muted-foreground">${expr ? `{${expr}}` : escape(str(node.props.value))}</p>`;
  },
  async label(node) {
    const forAttr = node.props.for ? ` htmlFor="${escapeAttr(str(node.props.for))}"` : "";
    const expr = maybeExpr(node.props.value);
    return `<Label${forAttr}>${expr ? `{${expr}}` : escape(str(node.props.value))}</Label>`;
  },
  async code(node) {
    const isBlock = !!node.props.block;
    const value = str(node.props.value);
    const expr = maybeExpr(node.props.value);
    const content = expr ? `{${expr}}` : escape(value);
    return isBlock
      ? `<pre className="rounded-md bg-muted p-4 overflow-x-auto"><code className="text-sm font-mono">${content}</code></pre>`
      : `<code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">${content}</code>`;
  },
  async markdown(node) {
    const expr = maybeExpr(node.props.value);
    const v = expr ?? JSON.stringify(str(node.props.value));
    return `<div dangerouslySetInnerHTML={{ __html: ${v} }} />`;
  },

  // ──────────── MEDIA ────────────
  async image(node) {
    const src = str(node.props.src);
    const alt = escapeAttr(str(node.props.alt));
    const fit = str(node.props.fit, "cover");
    const w = node.props.width ? ` width={${JSON.stringify(cssSize(node.props.width))}}` : "";
    const h = node.props.height ? ` height={${JSON.stringify(cssSize(node.props.height))}}` : "";
    return `<img src="${escapeAttr(src)}" alt="${alt}" style={{ objectFit: ${JSON.stringify(fit)} }}${w}${h} />`;
  },
  async icon(node) {
    const name = lucideIconName(str(node.props.name));
    const size = num(node.props.size, 20);
    const color = node.props.color ? ` color=${JSON.stringify(String(node.props.color))}` : "";
    return `{(() => { const __I = (require("lucide-react") as any)[${JSON.stringify(name)}] ?? (require("lucide-react") as any).Square; return <__I size={${size}}${color} aria-label="${escapeAttr(str(node.props.name))}" />; })()}`;
  },
  async video(node) {
    const attrs = [
      `src="${escapeAttr(str(node.props.src))}"`,
      node.props.controls !== false ? "controls" : "",
      node.props.autoplay ? "autoPlay" : "",
      node.props.loop ? "loop" : "",
      node.props.muted ? "muted" : "",
      node.props.poster ? `poster="${escapeAttr(str(node.props.poster))}"` : "",
    ].filter(Boolean).join(" ");
    return `<video ${attrs} />`;
  },
  async audio(node) {
    const attrs = [
      `src="${escapeAttr(str(node.props.src))}"`,
      node.props.controls !== false ? "controls" : "",
      node.props.autoplay ? "autoPlay" : "",
      node.props.loop ? "loop" : "",
    ].filter(Boolean).join(" ");
    return `<audio ${attrs} />`;
  },
  async canvas(node, ctx) {
    const w = node.props.width ? cssSize(node.props.width) : "300";
    const h = node.props.height ? cssSize(node.props.height) : "150";
    const drawExpr = maybeExpr(node.props.draw);
    const id = ctx.unique("canvas");
    if (drawExpr) {
      return `<canvas width={${w}} height={${h}} ref={(el) => { if (el) { const ctx = el.getContext("2d"); if (ctx) (${drawExpr})(ctx, el); } }} />`;
    }
    return `<canvas id="${id}" width={${w}} height={${h}} />`;
  },
  async webview(node) {
    const src = escapeAttr(str(node.props.src));
    return `<iframe src="${src}" style={{ width: "100%", height: "100%", border: 0 }} />`;
  },
  async lottie(node) {
    return `<div data-glyph-lottie-src="${escapeAttr(str(node.props.src))}" data-autoplay="${!!node.props.autoplay}" data-loop="${!!node.props.loop}" />`;
  },

  // ──────────── INPUT ────────────
  async "text-input"(node) {
    return shadcnInput(node, str(node.props.kind, "text"));
  },
  async "number-input"(node) {
    const extra: string[] = [];
    if (node.props.min !== undefined) extra.push(`min={${num(node.props.min)}}`);
    if (node.props.max !== undefined) extra.push(`max={${num(node.props.max)}}`);
    if (node.props.step !== undefined) extra.push(`step={${num(node.props.step)}}`);
    return shadcnInput(node, "number", extra.join(" "));
  },
  async checkbox(node) {
    const checked = valueExpr(node.props.checked, "checked");
    const onCheck = node.props.onChange !== undefined
      ? ` onCheckedChange={(v) => { ${maybeExpr(node.props.onChange) ?? ""}; }}`
      : "";
    return `<Checkbox${checked}${onCheck}${node.props.disabled ? " disabled" : ""} />`;
  },
  async radio(node) {
    return `<input type="radio" className="h-4 w-4 border-input" name="${escapeAttr(str(node.props.name))}" value="${escapeAttr(str(node.props.value))}"${valueExpr(node.props.checked, "checked")}${eventExpr(node.props.onChange, "onChange")} />`;
  },
  async switch(node) {
    const checked = valueExpr(node.props.value, "checked");
    const onCheck = node.props.onChange !== undefined
      ? ` onCheckedChange={(v) => { ${maybeExpr(node.props.onChange) ?? ""}; }}`
      : "";
    return `<Switch${checked}${onCheck}${node.props.disabled ? " disabled" : ""} />`;
  },
  async slider(node) {
    const valRaw = maybeExpr(node.props.value);
    const valueAttr = valRaw ? ` value={[${valRaw}]}` : node.props.value !== undefined ? ` value={[${JSON.stringify(node.props.value)}]}` : "";
    const onChange = node.props.onChange !== undefined
      ? ` onValueChange={(v) => { ${maybeExpr(node.props.onChange) ?? ""}; }}`
      : "";
    return `<Slider${valueAttr} min={${num(node.props.min, 0)}} max={${num(node.props.max, 100)}} step={${num(node.props.step, 1)}}${onChange} />`;
  },
  async select(node) {
    const optionsExpr = maybeExpr(node.props.options);
    const optionsJS = optionsExpr ?? JSON.stringify(node.props.options ?? []);
    const val = valueExpr(node.props.value, "value");
    const onCh = node.props.onChange !== undefined
      ? ` onValueChange={(v) => { ${maybeExpr(node.props.onChange) ?? ""}; }}`
      : "";
    const placeholder = escape(str(node.props.placeholder, "Select..."));
    return `<Select${val}${onCh}><SelectTrigger><SelectValue placeholder="${placeholder}" /></SelectTrigger><SelectContent>{(${optionsJS}).map((o: any) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>`;
  },
  async textarea(node) {
    const rows = num(node.props.rows, 3);
    return `<Textarea rows={${rows}}${valueExpr(node.props.value, "value")}${eventExpr(node.props.onChange, "onChange")}${node.props.placeholder ? ` placeholder=${JSON.stringify(str(node.props.placeholder))}` : ""}${node.props.disabled ? " disabled" : ""} />`;
  },
  async "file-input"(node) {
    const accept = node.props.accept ? ` accept=${JSON.stringify(str(node.props.accept))}` : "";
    const mult = node.props.multiple ? " multiple" : "";
    return `<Input type="file"${accept}${mult}${eventExpr(node.props.onChange, "onChange")} />`;
  },
  async "date-input"(node) {
    return `<Input type="date"${valueExpr(node.props.value, "value")}${eventExpr(node.props.onChange, "onChange")}${node.props.min ? ` min=${JSON.stringify(str(node.props.min))}` : ""}${node.props.max ? ` max=${JSON.stringify(str(node.props.max))}` : ""} />`;
  },
  async "color-input"(node) {
    return `<Input type="color" className="h-9 w-16 p-1"${valueExpr(node.props.value, "value")}${eventExpr(node.props.onChange, "onChange")} />`;
  },
  async "range-input"(node) {
    return `<div className="flex gap-2"><input type="range" className="w-full accent-primary"${valueExpr(node.props.valueLow, "value")} min={${num(node.props.min, 0)}} max={${num(node.props.max, 100)}} step={${num(node.props.step, 1)}}${eventExpr(node.props.onChange, "onChange")} /><input type="range" className="w-full accent-primary"${valueExpr(node.props.valueHigh, "value")} min={${num(node.props.min, 0)}} max={${num(node.props.max, 100)}} step={${num(node.props.step, 1)}}${eventExpr(node.props.onChange, "onChange")} /></div>`;
  },

  // ──────────── ACTION ────────────
  async button(node, ctx) {
    const label = node.props.label ? escape(str(node.props.label)) : "";
    const onClick = eventExpr(node.props.onClick, "onClick");
    const disabled = node.props.disabled ? " disabled" : "";
    const type = ` type="${str(node.props.type, "button")}"`;
    const variant = str(node.props.variant, "default");
    const size = str(node.props.size, "default");
    const inner = label || (await children(ctx, node));
    return `<Button${type}${onClick}${disabled} variant="${variant}" size="${size}">${inner}</Button>`;
  },
  async link(node, ctx) {
    const href = escapeAttr(str(node.props.href));
    const label = node.props.label ? escape(str(node.props.label)) : await children(ctx, node);
    const ext = node.props.external ? ` target="_blank" rel="noopener noreferrer"` : "";
    return `<a href="${href}" className="text-primary underline-offset-4 hover:underline"${ext}>${label}</a>`;
  },

  // ──────────── STRUCTURAL ────────────
  async app(node, ctx) {
    return await children(ctx, node);
  },
  async page(node, ctx) {
    const title = node.props.title ? `<title>${escape(str(node.props.title))}</title>` : "";
    return `<main>${title}${await children(ctx, node)}</main>`;
  },
  async route(node, ctx) {
    return await children(ctx, node);
  },
  async router(node, ctx) {
    return await children(ctx, node);
  },

  // ──────────── LOGIC ────────────
  async when(node, ctx) {
    const cond = maybeExpr(node.props.cond) ?? propToValue(node.props.cond);
    return `{(${cond}) ? <>${await children(ctx, node)}</> : null}`;
  },
  async repeat(node, ctx) {
    const source = maybeExpr(node.props.source) ?? propToValue(node.props.source);
    const as = str(node.props.as, "item");
    const indexAs = str(node.props.indexAs, "index");
    const keyExpr = maybeExpr(node.props.key);
    const keyAttr = keyExpr ? ` key={${keyExpr}}` : ` key={${indexAs}}`;
    return `{(${source} ?? []).map((${as}: any, ${indexAs}: number) => (<div${keyAttr}>${await children(ctx, node)}</div>))}`;
  },
  async match(node, ctx) {
    const value = maybeExpr(node.props.value) ?? propToValue(node.props.value);
    return `{(() => { const __m = ${value}; return <>${await children(ctx, node)}</>; })()}`;
  },
  async bind() {
    return "";
  },
  async state(node, ctx) {
    const name = str(node.props.name);
    const initial = propToValue(node.props.initial);
    const setter = `set${name.charAt(0).toUpperCase()}${name.slice(1)}`;
    return `{(() => { const [${name}, ${setter}] = useState(${initial}); return <>${await children(ctx, node)}</>; })()}`;
  },
  async action(node) {
    const name = str(node.props.name);
    const body = maybeExpr(node.props.body) ?? propToValue(node.props.body);
    const params = Array.isArray(node.props.params) ? node.props.params.join(", ") : "";
    return `{(() => { const ${name} = (${params}) => { ${body} }; return null; })()}`;
  },
  async effect(node) {
    const body = maybeExpr(node.props.body) ?? propToValue(node.props.body);
    const deps = Array.isArray(node.props.deps) ? node.props.deps.join(", ") : "";
    return `{(() => { useEffect(() => { ${body} }, [${deps}]); return null; })()}`;
  },
  async derive(node) {
    const name = str(node.props.name);
    const from = maybeExpr(node.props.from) ?? propToValue(node.props.from);
    return `{(() => { const ${name} = useMemo(() => (${from}), []); return null; })()}`;
  },

  // ──────────── STYLE ────────────
  async theme(node, ctx) {
    return `<div data-glyph-theme>${await children(ctx, node)}</div>`;
  },
  async style(node, ctx) {
    const rules = node.props.rules;
    const styleObj = typeof rules === "object" && rules !== null && !Array.isArray(rules) ? rules : {};
    const parts = Object.entries(styleObj).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(", ");
    const inner = await children(ctx, node);
    return `<div style={{${parts}}}>${inner}</div>`;
  },

  // ──────────── GESTURE ────────────
  async pressable(node, ctx) {
    const onPress = eventExpr(node.props.onPress, "onClick");
    const onLong = node.props.onLongPress ? ` onContextMenu={(e) => { e.preventDefault(); ${maybeExpr(node.props.onLongPress) ?? ""}; }}` : "";
    const disabled = node.props.disabled ? ` aria-disabled="true"` : "";
    return `<div role="button" tabIndex={0}${onPress}${onLong}${disabled} style={{ cursor: "pointer" }}>${await children(ctx, node)}</div>`;
  },
  async gesture(node, ctx) {
    return `<div>${await children(ctx, node)}</div>`;
  },
  async focusable(node, ctx) {
    const tabIndex = num(node.props.tabIndex, 0);
    const onFocus = eventExpr(node.props.onFocus, "onFocus");
    const onBlur = eventExpr(node.props.onBlur, "onBlur");
    return `<div tabIndex={${tabIndex}}${onFocus}${onBlur}>${await children(ctx, node)}</div>`;
  },
  async haptic() {
    return "";
  },

  // ──────────── ESCAPE ────────────
  async native(node) {
    const code = node.props.code;
    if (code && typeof code === "object" && !Array.isArray(code)) {
      const v = (code as Record<string, PropValue>).next;
      if (typeof v === "string") return v;
    }
    return "";
  },
};

function mapAlign(v: string): string {
  if (v === "start") return "flex-start";
  if (v === "end") return "flex-end";
  return v;
}

function mapJustify(v: string): string {
  if (v === "start") return "flex-start";
  if (v === "end") return "flex-end";
  if (v === "between") return "space-between";
  if (v === "around") return "space-around";
  return v;
}

function valueExpr(v: PropValue, attr: string): string {
  if (v === undefined) return "";
  const e = maybeExpr(v);
  if (e) return ` ${attr}={${e}}`;
  if (typeof v === "boolean") return v ? ` ${attr}` : "";
  return ` ${attr}={${JSON.stringify(v)}}`;
}

function eventExpr(v: PropValue, attr: string): string {
  if (v === undefined) return "";
  const e = maybeExpr(v);
  if (e) return ` ${attr}={(e) => { ${e} }}`;
  if (typeof v === "string") return ` ${attr}={(e) => { ${v} }}`;
  return "";
}

function shadcnInput(node: IRNode, type: string, extra = ""): string {
  const val = valueExpr(node.props.value, "value");
  const onCh = eventExpr(node.props.onChange, "onChange");
  const placeholder = node.props.placeholder ? ` placeholder=${JSON.stringify(str(node.props.placeholder))}` : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const name = node.props.name ? ` name=${JSON.stringify(str(node.props.name))}` : "";
  return `<Input type=${JSON.stringify(type)}${val}${onCh}${placeholder}${disabled}${name}${extra ? " " + extra : ""} />`;
}

function lucideIconName(name: string): string {
  // Map kebab-case icon name to PascalCase lucide export (e.g., "arrow-right" → "ArrowRight")
  return name
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

export const emit: Emitter = async (node, ctx) => {
  const emitter = emitters[node.kind];
  if (!emitter) {
    return {
      files: {},
      snippet: `<!-- ${node.kind}: no emitter -->`,
    };
  }
  const snippet = await emitter(node, ctx);
  return { files: {}, snippet };
};

export const ATOM_KINDS = Object.keys(emitters);
