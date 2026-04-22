import type { Adapter, FileMap } from "@cpl/core";
import nextAdapter from "@cpl/adapter-next";

function tauriShell(name: string): FileMap {
  return {
    "src-tauri/Cargo.toml": `[package]
name = "${name}"
version = "0.0.0"
edition = "2021"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tauri = { version = "2", features = [] }

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
`,
    "src-tauri/build.rs": `fn main() { tauri_build::build(); }
`,
    "src-tauri/tauri.conf.json": JSON.stringify(
      {
        productName: name,
        version: "0.0.0",
        identifier: `com.cpl.${name}`,
        build: {
          beforeDevCommand: "npm run dev",
          devUrl: "http://localhost:3000",
          beforeBuildCommand: "npm run build",
          frontendDist: "../out",
        },
        app: {
          windows: [{ title: name, width: 1024, height: 768 }],
          security: { csp: null },
        },
      },
      null,
      2
    ) + "\n",
    "src-tauri/src/main.rs": `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
`,
    "TAURI.md": `# ${name} — Tauri Desktop

This project wraps the Next.js web build in a Tauri Rust shell.

## Run

\`\`\`
npm install
npm run tauri dev
\`\`\`

Requires: Rust toolchain (https://rustup.rs) + Tauri prerequisites for your OS.
`,
  };
}

const tauriAdapter: Adapter = {
  id: "tauri",
  supportedTargets: ["desktop-mac", "desktop-win", "desktop-linux"],
  async scaffold(opts) {
    const webFiles = await nextAdapter.scaffold({ ...opts, target: "web" });
    return { ...webFiles, ...tauriShell(opts.project.name) };
  },
  emitAtom: nextAdapter.emitAtom,
};

export default tauriAdapter;
