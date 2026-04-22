import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { buildRegistry, loadAtoms, Registry } from "@cpl/core";

export async function loadProjectRegistry(projectDir: string): Promise<Registry> {
  const stdlibDir = findStdlibDir();
  const userDir = resolve(projectDir, "components");
  return buildRegistry({
    atoms: loadAtoms(),
    stdlibDir,
    userDir: existsSync(userDir) ? userDir : undefined,
  });
}

function findStdlibDir(): string | undefined {
  const candidates = [
    resolve(process.cwd(), "packages/stdlib"),
    resolve(import.meta.url.replace("file://", ""), "../../../stdlib"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return undefined;
}
