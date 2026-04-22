import type { Adapter } from "@cpl/core";
import { scaffoldFiles } from "./scaffold.js";
import { emit, ATOM_KINDS } from "./emit.js";

const nextAdapter: Adapter = {
  id: "next",
  supportedTargets: ["web"],
  async scaffold({ project }) {
    return scaffoldFiles({ name: project.name });
  },
  emitAtom: emit,
};

export default nextAdapter;
export { ATOM_KINDS };
