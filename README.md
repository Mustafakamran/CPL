# Glyph

**The common language that compiles anywhere.**

Glyph is a framework-agnostic language whose vocabulary is everyday English.
Programs are a tree of named primitives — `page`, `sidebar`, `button`,
`form`, `when`, `repeat` — and the Glyph compiler translates that tree into
real source code for a chosen platform (web, Android, desktop) through
pluggable **adapters**.

One manifest. Many targets. Ship to React today, Jetpack Compose tomorrow,
Flutter next week — without rewriting your app.

## Quickstart

```bash
pnpm install
pnpm -r build

cd examples/landing
node ../../packages/cli/dist/index.js doctor
node ../../packages/cli/dist/index.js build --out ./out
cd out && npm install && npm run dev
```

`out/` is a Next.js 15 project that renders a topbar + hero + feature grid.

## Retarget the same app to Android

Edit two lines in `project.glyph`:

```yaml
target: android
adapter: compose
```

…then `glyph build`. You get a Gradle + Jetpack Compose project.

## What's in the box

- **CLI** (`glyph init`, `glyph add`, `glyph build`, `glyph doctor`, …)
- **Core**: IR, validator, compound expander, adapter interface
- **60 atoms** — irreducible UI and logic primitives
- **34 stdlib compounds** — higher-level widgets (topbar, sidebar, card, …)
- **4 adapters** — `next` (web), `compose` (Android), `tauri` (desktop),
  `flutter` (cross-platform secondary)

## Glyph Studio

A desktop visual editor for Glyph — think Figma, but it emits real code —
is the next product on the roadmap. Not built yet.

## Learn more

- [`SPEC.md`](./SPEC.md) — language specification
- [`CLAUDE.md`](./CLAUDE.md) — architecture overview and contribution guide
