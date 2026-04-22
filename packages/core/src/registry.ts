import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { AtomDef, CompoundDef, PrimitiveDef } from "./ir.js";
import { parseCompound } from "./compound-parser.js";

export class Registry {
  private atoms = new Map<string, AtomDef>();
  private compounds = new Map<string, CompoundDef>();

  registerAtom(def: AtomDef): void {
    if (this.atoms.has(def.kind) || this.compounds.has(def.kind)) {
      throw new Error(`Duplicate primitive kind: ${def.kind}`);
    }
    this.atoms.set(def.kind, def);
  }

  registerCompound(def: CompoundDef): void {
    if (this.atoms.has(def.kind) || this.compounds.has(def.kind)) {
      throw new Error(`Duplicate primitive kind: ${def.kind}`);
    }
    this.compounds.set(def.kind, def);
  }

  get(kind: string): PrimitiveDef | undefined {
    const a = this.atoms.get(kind);
    if (a) return { type: "atom", ...a };
    const c = this.compounds.get(kind);
    if (c) return { type: "compound", ...c };
    return undefined;
  }

  isAtom(kind: string): boolean {
    return this.atoms.has(kind);
  }

  isCompound(kind: string): boolean {
    return this.compounds.has(kind);
  }

  listAtoms(): AtomDef[] {
    return [...this.atoms.values()];
  }

  listCompounds(): CompoundDef[] {
    return [...this.compounds.values()];
  }

  listAll(): PrimitiveDef[] {
    return [
      ...this.listAtoms().map((a): PrimitiveDef => ({ type: "atom", ...a })),
      ...this.listCompounds().map((c): PrimitiveDef => ({ type: "compound", ...c })),
    ];
  }

  async loadCompoundsFromDir(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        await this.loadCompoundsFromDir(p);
      } else if (e.isFile() && e.name.endsWith(".glyph")) {
        const src = await readFile(p, "utf8");
        const def = parseCompound(src, p);
        this.registerCompound(def);
      }
    }
  }
}

export async function buildRegistry(opts: {
  atoms: AtomDef[];
  stdlibDir?: string;
  userDir?: string;
}): Promise<Registry> {
  const reg = new Registry();
  for (const a of opts.atoms) reg.registerAtom(a);
  if (opts.stdlibDir) await reg.loadCompoundsFromDir(opts.stdlibDir);
  if (opts.userDir) {
    try {
      await reg.loadCompoundsFromDir(opts.userDir);
    } catch {
      /* user dir optional */
    }
  }
  return reg;
}
