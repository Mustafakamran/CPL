import { resolve, dirname } from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { loadManifest } from "../manifest.js";

export async function defineCommand(argv: string[]): Promise<void> {
  const [kind] = argv;
  if (!kind) throw new Error("Usage: cpl define <kind>");
  if (!/^[a-z][a-z0-9-]*$/.test(kind)) {
    throw new Error(`Invalid kind name '${kind}'. Use kebab-case.`);
  }
  const { path } = await loadManifest();
  const projectDir = dirname(path);
  const compDir = resolve(projectDir, "components");
  await mkdir(compDir, { recursive: true });
  const file = resolve(compDir, `${kind}.cpl`);
  if (existsSync(file)) throw new Error(`Already exists: ${file}`);
  const template = `kind: ${kind}
category: ui
docs: Describe what ${kind} does.
props:
  # example:
  # title: { type: string, required: true }
body:
  - kind: box
    props:
      padding: 16
    children:
      - kind: slot
        props: {}
`;
  await writeFile(file, template, "utf8");
  console.log(`Created ${file}`);
  console.log(`Edit the body to compose ${kind} from atoms and other compounds.`);
}
