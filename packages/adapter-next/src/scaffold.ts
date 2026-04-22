import type { FileMap } from "@glyph/core";
import {
  SHADCN_UTILS,
  SHADCN_BUTTON,
  SHADCN_INPUT,
  SHADCN_TEXTAREA,
  SHADCN_LABEL,
  SHADCN_CARD,
  SHADCN_BADGE,
  SHADCN_SEPARATOR,
  SHADCN_SKELETON,
  SHADCN_ALERT,
  SHADCN_AVATAR,
  SHADCN_CHECKBOX,
  SHADCN_SWITCH,
  SHADCN_SLIDER,
  SHADCN_PROGRESS,
  SHADCN_RADIO_GROUP,
  SHADCN_SELECT,
  SHADCN_DIALOG,
  SHADCN_TABS,
  SHADCN_TOOLTIP,
  SHADCN_POPOVER,
  SHADCN_DROPDOWN_MENU,
  SHADCN_ACCORDION,
  SHADCN_SONNER,
  TAILWIND_CONFIG,
  POSTCSS_CONFIG,
  COMPONENTS_JSON,
  GLOBALS_CSS,
} from "./shadcn-components.js";

export function scaffoldFiles(opts: { name: string }): FileMap {
  const packageJson = {
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
      "class-variance-authority": "^0.7.0",
      clsx: "^2.1.1",
      "tailwind-merge": "^2.5.0",
      "tailwindcss-animate": "^1.0.7",
      "lucide-react": "^0.454.0",
      sonner: "^1.5.0",
      "@radix-ui/react-accordion": "^1.2.0",
      "@radix-ui/react-checkbox": "^1.1.0",
      "@radix-ui/react-dialog": "^1.1.0",
      "@radix-ui/react-dropdown-menu": "^2.1.0",
      "@radix-ui/react-popover": "^1.1.0",
      "@radix-ui/react-progress": "^1.1.0",
      "@radix-ui/react-radio-group": "^1.2.0",
      "@radix-ui/react-select": "^2.1.0",
      "@radix-ui/react-slider": "^1.2.0",
      "@radix-ui/react-switch": "^1.1.0",
      "@radix-ui/react-tabs": "^1.1.0",
      "@radix-ui/react-tooltip": "^1.1.0",
    },
    devDependencies: {
      typescript: "^5.5.0",
      "@types/node": "^20.12.0",
      "@types/react": "^18.3.0",
      "@types/react-dom": "^18.3.0",
      tailwindcss: "^3.4.0",
      postcss: "^8.4.0",
      autoprefixer: "^10.4.0",
    },
  };

  const tsconfig = {
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
  };

  return {
    "package.json": JSON.stringify(packageJson, null, 2) + "\n",
    "tsconfig.json": JSON.stringify(tsconfig, null, 2) + "\n",
    "next.config.js": "module.exports = { reactStrictMode: true };\n",
    "tailwind.config.ts": TAILWIND_CONFIG,
    "postcss.config.mjs": POSTCSS_CONFIG,
    "components.json": COMPONENTS_JSON,
    "src/lib/utils.ts": SHADCN_UTILS,
    "src/app/globals.css": GLOBALS_CSS,
    "src/app/layout.tsx": `import type { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata = { title: ${JSON.stringify(opts.name)} };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
`,
    "src/app/page.tsx": `"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

export default function Page() {
  return (
    <>
      __GLYPH_EMITTED_NODES__
    </>
  );
}
`,
    "src/components/ui/button.tsx": SHADCN_BUTTON,
    "src/components/ui/input.tsx": SHADCN_INPUT,
    "src/components/ui/textarea.tsx": SHADCN_TEXTAREA,
    "src/components/ui/label.tsx": SHADCN_LABEL,
    "src/components/ui/card.tsx": SHADCN_CARD,
    "src/components/ui/badge.tsx": SHADCN_BADGE,
    "src/components/ui/separator.tsx": SHADCN_SEPARATOR,
    "src/components/ui/skeleton.tsx": SHADCN_SKELETON,
    "src/components/ui/alert.tsx": SHADCN_ALERT,
    "src/components/ui/avatar.tsx": SHADCN_AVATAR,
    "src/components/ui/checkbox.tsx": SHADCN_CHECKBOX,
    "src/components/ui/switch.tsx": SHADCN_SWITCH,
    "src/components/ui/slider.tsx": SHADCN_SLIDER,
    "src/components/ui/progress.tsx": SHADCN_PROGRESS,
    "src/components/ui/radio-group.tsx": SHADCN_RADIO_GROUP,
    "src/components/ui/select.tsx": SHADCN_SELECT,
    "src/components/ui/dialog.tsx": SHADCN_DIALOG,
    "src/components/ui/tabs.tsx": SHADCN_TABS,
    "src/components/ui/tooltip.tsx": SHADCN_TOOLTIP,
    "src/components/ui/popover.tsx": SHADCN_POPOVER,
    "src/components/ui/dropdown-menu.tsx": SHADCN_DROPDOWN_MENU,
    "src/components/ui/accordion.tsx": SHADCN_ACCORDION,
    "src/components/ui/sonner.tsx": SHADCN_SONNER,
    "src/glyph-runtime.tsx": `"use client";
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
