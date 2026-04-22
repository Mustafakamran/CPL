#!/usr/bin/env node
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { adaptersCommand } from "./commands/adapters.js";
import { doctorCommand } from "./commands/doctor.js";
import { buildCommand } from "./commands/build.js";
import { defineCommand } from "./commands/define.js";

const HELP = `cpl — Common Programming Language

Usage:
  cpl init                       Create a new project
  cpl add <kind> [opts]          Append a primitive to the manifest
  cpl define <kind>              Scaffold a new user compound
  cpl list [--atoms|--compounds] [--category C]
  cpl adapters                   Print installed adapters and their targets
  cpl build [--out DIR]          Compile manifest → framework project
  cpl doctor                     Validate manifest, adapter, vocabulary
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
