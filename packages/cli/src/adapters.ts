import type { Adapter } from "@cpl/core";
import nextAdapter from "@cpl/adapter-next";
import composeAdapter from "@cpl/adapter-compose";
import tauriAdapter from "@cpl/adapter-tauri";
import flutterAdapter from "@cpl/adapter-flutter";

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
