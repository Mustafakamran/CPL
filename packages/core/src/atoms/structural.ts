import type { AtomDef } from "../ir.js";

const app: AtomDef = {
  kind: "app",
  category: "structural",
  docs: "Root of the application. Contains router and global providers.",
  props: { title: { type: "string" } },
  children: { allowed: true },
};

const page: AtomDef = {
  kind: "page",
  category: "structural",
  docs: "A single screen / route body.",
  props: { title: { type: "string" } },
  children: { allowed: true },
};

const route: AtomDef = {
  kind: "route",
  category: "structural",
  docs: "Declarative route: maps a path to a page.",
  props: {
    path: { type: "string", required: true },
    name: { type: "string" },
  },
  children: { allowed: true },
};

const router: AtomDef = {
  kind: "router",
  category: "structural",
  docs: "Groups routes. Child routes are mounted under this router.",
  props: {},
  children: { allowed: true },
};

export const STRUCTURAL_ATOMS: AtomDef[] = [app, page, route, router];
