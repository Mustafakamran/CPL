import type { Adapter } from "@glyph/core";
import nextAdapter from "@glyph/adapter-next";
import composeAdapter from "@glyph/adapter-compose";
import tauriAdapter from "@glyph/adapter-tauri";
import flutterAdapter from "@glyph/adapter-flutter";

export const BUILTIN_ADAPTERS: Adapter[] = [
  nextAdapter,
  composeAdapter,
  tauriAdapter,
  flutterAdapter,
];

export function getAdapter(id: string): Adapter {
  const a = BUILTIN_ADAPTERS.find((x) => x.id === id);
  if (!a) {
    const ids = BUILTIN_ADAPTERS.map((x) => x.id).join(", ");
    throw new Error(`Unknown adapter '${id}'. Available: ${ids}`);
  }
  return a;
}

export function adaptersForTarget(target: string): Adapter[] {
  return BUILTIN_ADAPTERS.filter((a) => a.supportedTargets.includes(target as never));
}
