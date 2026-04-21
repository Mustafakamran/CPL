# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Status

This repository is in an initial / empty state. As of this writing it contains only `README.md`, which describes the project as "CPL — Common Programing Language".

There is no source code, build system, test suite, dependency manifest, linter configuration, or CI pipeline yet. Standard commands (build, lint, test, run) do not exist and should not be assumed.

## Working in This Repository

- Before adding tooling (package manager, build scripts, test runner, formatter, etc.), confirm the intended language and toolchain with the user — the README does not specify one.
- When the first source files are introduced, update this file with the actual build / test / run commands and a real architecture overview. Avoid filling it with speculative or generic guidance until concrete decisions exist.
- The project name in `README.md` contains a typo ("Programing" → "Programming"). Do not silently "fix" it during unrelated work; raise it with the user first in case the spelling is intentional.

## Branching

Development for the current task happens on `claude/add-claude-documentation-kKKOb`. Push to that branch unless the user specifies otherwise.
