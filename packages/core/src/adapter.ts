import type { IRNode, Target, EmitResult, FileMap } from "./ir.js";

export interface EmitContext {
  target: Target;
  project: { name: string };
  emitChildren: (nodes: IRNode[]) => Promise<string>;
  unique: (prefix: string) => string;
}

export type Emitter = (node: IRNode, ctx: EmitContext) => Promise<EmitResult>;

export interface Adapter {
  id: string;
  supportedTargets: Target[];
  scaffold: (opts: { project: { name: string }; target: Target }) => Promise<FileMap>;
  emitAtom: Emitter;
  overrideFor?: (kind: string) => Emitter | undefined;
  postBuild?: (out: FileMap, opts: { target: Target }) => Promise<FileMap>;
}
