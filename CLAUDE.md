# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## What CPL is

CPL — Common Programming Language — is a framework-agnostic language whose
vocabulary is everyday English. Programs are a tree of named primitives; the
compiler translates that tree into real source code for a chosen platform
through pluggable **adapters**.

See `SPEC.md` for the normative language spec.

## Architecture (mandatory reading before editing)

Four layers, clean boundaries:

1. **CLI** (`packages/cli`) — user-facing commands.
2. **Manifest** — `project.cpl` YAML is the source of truth.
3. **Core** (`packages/core`) — IR, validator, compound expander, registry,
   adapter interface.
4. **Adapters** (`packages/adapter-*`) — framework-specific emitters.

The language vocabulary comes in two flavors:

- **Atoms** — 60 irreducible primitives (`packages/core/src/atoms/`). Every
  adapter must implement an emitter for every atom. This is the only place
  per-adapter work lives.
- **Compounds** — any number of primitives defined in CPL itself (`.cpl`
  files). They expand to atoms, so they work on every adapter for free.

Ship new widgets as compounds. Only add an atom when something can't be
expressed by composing existing atoms.

## Layout

```
packages/
  core/                    IR, registry, validator, expander, 60 atom schemas
  cli/                     `cpl` binary
  adapter-next/            Next.js/React — flagship web adapter (full 60 atom coverage)
  adapter-tauri/           Tauri desktop — delegates atoms to adapter-next
  adapter-compose/         Jetpack Compose (Android) — v0 emits placeholder
                           Kotlin for every atom; full production emission is a
                           follow-up (core architecture guarantees this is
                           purely additive work)
  adapter-flutter/         Flutter — same follow-up note as adapter-compose
  stdlib/                  34 compounds in v0 (ui, nav, form, data, social,
                           commerce, action, media). Target is ~150; purely
                           additive — no adapter work per compound.
examples/
  landing/                 End-to-end smoke test (web)
  landing-android/         Same manifest, compose adapter
SPEC.md                    Language spec
CLAUDE.md                  This file
```

## Run / build / test

```bash
pnpm install           # install workspace deps
pnpm -r build          # build every package (core → adapters → cli)
pnpm -r test           # 85 tests across all 6 packages
```

The `cpl` CLI is built as a Node binary under
`packages/cli/dist/index.js`. Invoke it with
`node packages/cli/dist/index.js <command>`.

### End-to-end smoke test (web)

```bash
cd examples/landing
node ../../packages/cli/dist/index.js doctor       # expect: clean
node ../../packages/cli/dist/index.js build --out ./out
# out/ contains a Next.js 15 project. `cd out && npm install && npm run dev`
# renders a topbar + hero + three-card feature grid.
```

### Cross-adapter smoke test

The same `project.cpl` can be retargeted to Android by editing two lines:

```yaml
target: android
adapter: compose
```

Then `cpl build` emits a Gradle + Compose Android project. See
`examples/landing-android/`.

## Adding things

### New compound (common case)

Create `packages/stdlib/<category>/<kind>.cpl` (or `./components/<kind>.cpl`
in a user project). Declare `kind`, `category`, `props`, `body`. Reference
atoms and other compounds in the body. Use `{{ props.NAME }}` for
interpolation and `kind: slot` for the caller's-children insertion point.

No adapter changes needed. Works on every adapter immediately.

### New atom (rare)

1. Add schema file under `packages/core/src/atoms/<category>.ts`.
2. Export it from `packages/core/src/atoms/index.ts`.
3. Add an emitter in **every** adapter (`packages/adapter-*/src/`, in the
   `emitters` map for each adapter).
4. `contract.test.ts` in each adapter package enforces coverage — missing
   an emitter fails CI.

### New adapter

Create `packages/adapter-<id>/` with a default-exported `Adapter`
implementation. Implement `scaffold`, `emitAtom`, optionally `overrideFor`
and `postBuild`. Declare `supportedTargets`. Wire it into the
`BUILTIN_ADAPTERS` array in `packages/cli/src/adapters.ts`.

### Compound override

An adapter may ship a native emitter for a specific compound by returning
an emitter from `overrideFor(kind)`. The expander skips expansion for that
kind and calls the override directly. Example: `adapter-compose` overrides
`floating-action-button` with a Material 3 FAB.

## Known v0 gaps (follow-up work)

- `adapter-compose` and `adapter-flutter` emit **placeholder** Kotlin/Dart
  for most atoms — enough to satisfy the contract test and produce a
  project that structurally compiles, but not production-quality widgets.
  The next piece of work is promoting these to full emission. No core,
  CLI, or spec changes required.
- Stdlib ships 34 compounds; the design target is ~150. All growth is
  additive — just drop more `.cpl` files.
- iOS (SwiftUI) adapter does not exist yet.
- Real integration implementations for `remote-desktop`, `map`, `auth`
  need to be written; current stdlib placeholders will be updated.
- Project-level `.cpl` source syntax (beyond compound definitions) is
  planned but not in v0.
- `examples/` ships `landing` (web) and `landing-android` (compose); the
  planned `dashboard`, `chat`, `commerce`, `settings` are TODO.

## README typo

`README.md` says "Common Programing Language" (single "m"). Do not
silently "fix" it during unrelated work — raise it with the user first.

## Branching

Current development branch: `claude/add-claude-documentation-kKKOb`. Push
there unless the user specifies otherwise.
