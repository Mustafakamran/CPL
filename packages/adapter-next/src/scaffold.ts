import type { FileMap } from "@cpl/core";

export function scaffoldFiles(opts: { name: string }): FileMap {
  return {
    "package.json": JSON.stringify(
      {
        name: opts.name,
        private: true,
        version: "0.0.0",
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
        },
        dependencies: {
          next: "^15.0.0",
          react: "^18.3.0",
          "react-dom": "^18.3.0",
        },
        devDependencies: {
          typescript: "^5.5.0",
          "@types/node": "^20.12.0",
          "@types/react": "^18.3.0",
          "@types/react-dom": "^18.3.0",
        },
      },
      null,
      2
    ) + "\n",
    "tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["dom", "dom.iterable", "ES2022"],
          jsx: "preserve",
          module: "esnext",
          moduleResolution: "bundler",
          strict: true,
          esModuleInterop: true,
          resolveJsonModule: true,
          isolatedModules: true,
          skipLibCheck: true,
          incremental: true,
          plugins: [{ name: "next" }],
          paths: { "@/*": ["./src/*"] },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
        exclude: ["node_modules"],
      },
      null,
      2
    ) + "\n",
    "next.config.js": "module.exports = { reactStrictMode: true };\n",
    "src/app/globals.css": `:root { color-scheme: light dark; }
body { margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
* { box-sizing: border-box; }
`,
    "src/app/layout.tsx": `import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: ${JSON.stringify(opts.name)} };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
    "src/app/page.tsx": `"use client";
import { useState, useEffect, useMemo } from "react";

export default function Page() {
  return (
    <>
      __CPL_EMITTED_NODES__
    </>
  );
}
`,
    "src/cpl-runtime.tsx": `"use client";
import { useEffect, useRef } from "react";

export function useHaptic() {
  return (intensity: "light" | "medium" | "heavy" = "light") => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      const ms = intensity === "heavy" ? 30 : intensity === "medium" ? 15 : 5;
      navigator.vibrate(ms);
    }
  };
}

export function useCanvasDraw(
  draw: ((ctx: CanvasRenderingContext2D, el: HTMLCanvasElement) => void) | undefined
) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!ref.current || !draw) return;
    const ctx = ref.current.getContext("2d");
    if (ctx) draw(ctx, ref.current);
  }, [draw]);
  return ref;
}
`,
  };
}
