import type { PropValue } from "@glyph/core";

export function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function jsxAttr(name: string, value: PropValue): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "boolean") return value ? ` ${name}` : "";
  if (typeof value === "string") {
    if (isExpr(value)) {
      return ` ${name}={${stripExpr(value)}}`;
    }
    return ` ${name}="${escapeAttr(value)}"`;
  }
  if (typeof value === "number") return ` ${name}={${value}}`;
  return ` ${name}={${JSON.stringify(value)}}`;
}

export function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;");
}

export function isExpr(s: string): boolean {
  return /^\{\{.*\}\}$/.test(s.trim());
}

export function stripExpr(s: string): string {
  return s.trim().slice(2, -2).trim();
}

export function expr(value: PropValue): string {
  if (typeof value === "string" && isExpr(value)) return stripExpr(value);
  return JSON.stringify(value);
}

export function styleObject(style: Record<string, PropValue>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(style)) {
    if (v === undefined || v === null) continue;
    parts.push(`${JSON.stringify(k)}: ${typeof v === "string" && !isExpr(v) ? JSON.stringify(v) : typeof v === "string" ? stripExpr(v) : JSON.stringify(v)}`);
  }
  return `{${parts.join(", ")}}`;
}

export function cssSize(v: PropValue): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "number") return `${v}px`;
  return String(v);
}

export function propToValue(value: PropValue): string {
  if (value === undefined || value === null) return "undefined";
  if (typeof value === "string") {
    if (isExpr(value)) return stripExpr(value);
    return JSON.stringify(value);
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
