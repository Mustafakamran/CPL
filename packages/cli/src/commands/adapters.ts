import { BUILTIN_ADAPTERS } from "../adapters.js";

export async function adaptersCommand(_argv: string[]): Promise<void> {
  console.log("Installed adapters:\n");
  for (const a of BUILTIN_ADAPTERS) {
    console.log(`  ${a.id}`);
    console.log(`    targets: ${a.supportedTargets.join(", ")}`);
  }
}
