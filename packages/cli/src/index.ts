#!/usr/bin/env node
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { adaptersCommand } from "./commands/adapters.js";
import { doctorCommand } from "./commands/doctor.js";
import { buildCommand } from "./commands/build.js";
import { defineCommand } from "./commands/define.js";

const HELP = `glyph — the common language that compiles anywhere

Usage:
  glyph init                       Create a new project
  glyph add <kind> [opts]          Append a primitive to the manifest
  glyph define <kind>              Scaffold a new user compound
  glyph list [--atoms|--compounds] [--category C]
  glyph adapters                   Print installed adapters and their targets
  glyph build [--out DIR]          Compile manifest → framework project
  glyph doctor                     Validate manifest, adapter, vocabulary
`;

async function main(): Promise<void> {
  const [, , cmd, ...rest] = process.argv;
  try {
    switch (cmd) {
      case "init": return await initCommand(rest);
      case "add": return await addCommand(rest);
      case "define": return await defineCommand(rest);
      case "list": return await listCommand(rest);
      case "adapters": return await adaptersCommand(rest);
      case "build": return await buildCommand(rest);
      case "doctor": return await doctorCommand(rest);
      case "--help":
      case "-h":
      case undefined:
        console.log(HELP);
        return;
      default:
        console.error(`Unknown command: ${cmd}\n`);
        console.log(HELP);
        process.exit(1);
    }
  } catch (e) {
    console.error(`Error: ${(e as Error).message}`);
    process.exit(1);
  }
}

main();
