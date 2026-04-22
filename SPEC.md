# Glyph Language Specification (v0)

Glyph is a framework-agnostic language whose vocabulary is everyday English.
Programs are described as a tree of named primitives. A compiler translates
the tree into real code for a chosen platform (web, Android, desktop, …)
through pluggable **adapters**.

This document is the normative spec for v0.

## Architecture layers

```
Manifest (project.glyph, YAML)
    ↓ parse + validate
IR (target- and adapter-independent AST)
    ↓ expand compounds to atoms
Atom-only IR
    ↓ adapter.emitAtom(...) per node
Framework source + project files
```

## Primitives: atoms and compounds

There are exactly two kinds of primitive:

### Atom

An irreducible primitive, declared in `packages/core/src/atoms/<category>/<kind>.ts`.
Every adapter MUST implement an emitter for every atom. Missing any atom in any
adapter is a test failure (see `adapter-contract.test.ts`). v0 ships 60 atoms.

### Compound

A primitive defined in Glyph itself — a `.glyph` file that declares its own
`kind`, `props`, and a `body` composed of atoms and/or other compounds. No
per-adapter work is required to ship a compound: it expands to atoms, and the
adapter already knows how to emit atoms.

Compounds may ship in:
- `packages/stdlib/` — official standard library (~150 planned; 34 in v0)
- `./components/` in any project — user-defined compounds
- `@org/glyph-stdlib-*` packages — third-party compound packs

## Adapter interface

```ts
interface Adapter {
  id: string;                     // "next" | "compose" | "tauri" | "flutter" | …
  supportedTargets: Target[];     // ["web"] | ["android"] | ["desktop-mac", …] | …
  scaffold(opts): Promise<FileMap>;
  emitAtom(node: IRNode, ctx: EmitContext): Promise<EmitResult>;
  overrideFor?(kind: string): Emitter | undefined;   // native compound override
  postBuild?(files: FileMap, opts): Promise<FileMap>;
}
```

An adapter declares which targets it supports. One target can be served by
multiple adapters (e.g., web can be served by `next` or `flutter`). At
`glyph init` the user picks (target, adapter).

### Compound override

An adapter MAY provide a native emitter for a specific compound `kind` by
returning it from `overrideFor(kind)`. When present, the expander does not
expand that node — the adapter's native emitter is called directly. Use
sparingly; only when the native affordance is meaningfully different.

v0 demonstrates this mechanism in `adapter-compose`:
- `floating-action-button` → Material 3 `FloatingActionButton`
- `action-sheet` → `ModalBottomSheet`

## Manifest format: `project.glyph`

YAML. Required fields: `target`, `adapter`, `project.name`, `nodes`.

```yaml
target: web
adapter: next
project:
  name: landing
nodes:
  - kind: app
    props: {}
    children:
      - kind: page
        props:
          title: Welcome
        children:
          - kind: heading
            props:
              value: Hello world
              level: "1"
```

### IR node shape

Every node has:
- `kind: string` — name of a registered atom or compound
- `name?: string` — optional identifier for referencing with `--parent`
- `props: Record<string, PropValue>`
- `children: IRNode[]`

### Valid targets (v0)

`web`, `android`, `ios`, `desktop-mac`, `desktop-win`, `desktop-linux`. v0
does not ship an iOS adapter, but the target is reserved.

## Compound definition format: `*.glyph`

Also YAML. Required: `kind`, `category`, `body`.

```yaml
kind: card
category: ui
docs: Rectangular container with padding, rounded corners, and a border.
props:
  padding: { type: any, default: 16 }
  radius: { type: any, default: 8 }
body:
  - kind: box
    props:
      padding: "{{ props.padding }}"
      radius: "{{ props.radius }}"
      background: "#fff"
      border: "1px solid #e5e7eb"
    children:
      - kind: slot
        props: {}
```

### Slot

A child with `kind: slot` marks the insertion point for the caller's children.
If a compound has no `slot`, caller's children are dropped.

### Interpolation

String prop values of the form `"{{ props.NAME }}"` are replaced with the
corresponding value at expansion time. If the entire string is one
interpolation (matches `^\{\{ props\.NAME \}\}$`), the substituted value
preserves its original type (number, boolean, object). Otherwise it is
coerced to a string.

## Prop schemas

Allowed `type` values:
- `"string"` · `"number"` · `"boolean"` · `"any"` · `"expr"`
- `{ kind: "enum", values: [...] }`
- `{ kind: "array", of: TYPE }`
- `{ kind: "object", shape: { field: TYPE, ... } }`

A prop schema entry may also specify:
- `default` — used when the prop is omitted
- `required: true` — validation error if omitted and no default
- `docs` — documentation string

### The `expr` type

A prop typed `expr` holds a code fragment that is emitted as-is in the target
language (wrapped in `{{ }}` to distinguish it from a literal string). It is
the primary mechanism by which Glyph attaches target-language behavior to
primitives.

## CLI

```
glyph init                      Interactive: pick target, adapter, name
glyph add <kind> [opts]         Append node: --name, --parent, --prop k=v
glyph define <kind>              Scaffold ./components/<kind>.glyph
glyph list [--atoms|--compounds] [--category C]
glyph adapters                  Installed adapters and their supported targets
glyph build [--out DIR]         Compile manifest → framework project (default ./out)
glyph doctor                    Validate manifest, adapter, vocabulary
```

## Naming rules

- Primitive kinds are kebab-case: `text-input`, `remote-desktop`.
- Adapter ids are lowercase, no separators: `next`, `compose`, `flutter`.
- Compound names reserved by atoms may not be reused.

## Growing the vocabulary

- New compound → drop a `.glyph` file; runs on every adapter automatically.
- New atom → add a schema file; every adapter must add an emitter. The
  adapter-contract test will fail until they do.
- New adapter → new `packages/adapter-<id>/` package implementing `Adapter`;
  CLI auto-registers it.
- New target → add the target string to the `Target` union in core; ship an
  adapter that declares `supportedTargets: ["<target>"]`.
