# VtM Campaign Manager — Claude Instructions

Before starting any task, read:

- `.claude/commands/architecture.md` — project architecture, layer rules, and naming conventions
- `.claude/commands/feature.md` — mandatory workflow for implementing any feature

## Non-negotiable Rules

- Never write implementation code before generating a plan and receiving explicit approval
- Never skip tests — every use case and service must have unit tests
- Never import UI-layer code from domain or infrastructure layers
- Never import infrastructure code directly from domain layers
- Never break existing passing tests
- If something is not covered by the plan, stop and ask

## Stack

- Runtime: Tauri 2.0 (Rust backend)
- Bundler: Vite
- Language: TypeScript (strict mode)
- UI: Lit web components
- Markdown: marked with custom VTMD plugin
- Testing: Vitest

## File Conventions

- One class or interface per file
- Filename matches exported name exactly
- All domain files are pure TypeScript — no Tauri imports, no Lit imports
- Test files live alongside source files: `SpendBloodUseCase.ts` → `SpendBloodUseCase.test.ts`

## Versioning

`package.json` is the single source of truth for the app version. `tauri.conf.json` reads from it automatically.

To bump the version, run the appropriate script and then commit + push to `master`. The CI release workflow triggers automatically when it detects a new version.

| Change type | Command | Example |
|---|---|---|
| Bug fix | `npm run version:patch` | `0.1.0 → 0.1.1` |
| New feature | `npm run version:minor` | `0.1.0 → 0.2.0` |
| Breaking change | `npm run version:major` | `0.1.0 → 1.0.0` |

**When the user asks to bump the version**, determine the type from context (bug fix → patch, new feature → minor, breaking → major) and run the corresponding npm script.
