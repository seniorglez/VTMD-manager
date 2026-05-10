# VtM Campaign Manager

A desktop application for managing **Vampire: The Masquerade V20** tabletop RPG campaigns. Built with Tauri, Lit, and TypeScript using a clean layered architecture.

---

## Features

- **VTMD format** — extended Markdown for campaign documents (characters, chapters, modules, NPCs)
- **Interactive campaign management** — blood pool tracking, dice rolls, secret reveals
- **Offline-first** — all data stored as local files on your machine
- **Cross-platform** — macOS, Windows, Linux via Tauri

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | [Tauri 2.0](https://tauri.app) |
| Frontend bundler | [Vite](https://vitejs.dev) |
| Language | TypeScript |
| UI components | [Lit](https://lit.dev) |
| Markdown parser | [marked](https://marked.js.org) with custom VTMD extensions |
| Testing | [Vitest](https://vitest.dev) |

---

## Prerequisites

- [Node.js](https://nodejs.org) >= 20
- [Rust](https://www.rust-lang.org/tools/install) — install with:
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```

### Linux system dependencies

Tauri requires the following system libraries on Linux (Debian/Ubuntu):

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  pkg-config
```

For other distributions see the [Tauri prerequisites guide](https://tauri.app/start/prerequisites/).

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development mode

```bash
npm run dev
```

This starts the Vite dev server and the Tauri window simultaneously with hot reload.

### 3. Run tests

```bash
npm run test
```

### 4. Build for production

```bash
npm run build
```

The compiled native app will be in `src-tauri/target/release/bundle/`.

---

## Project Structure

```
vtm-campaign-manager/
├── src/
│   ├── domain/                        # Business logic — no framework dependencies
│   │   ├── character/
│   │   │   ├── models/                # Entities and value objects
│   │   │   ├── usecases/              # One file per use case
│   │   │   ├── services/
│   │   │   └── CharacterBLC.ts        # Public facade for the UI
│   │   ├── combat/
│   │   │   ├── models/
│   │   │   ├── usecases/
│   │   │   ├── services/
│   │   │   └── CombatBLC.ts
│   │   └── campaign/
│   │       ├── models/
│   │       ├── usecases/
│   │       ├── services/
│   │       └── CampaignBLC.ts
│   ├── infrastructure/
│   │   ├── repositories/              # Tauri fs commands abstraction
│   │   └── tauri/                     # Tauri invoke wrappers
│   └── ui/
│       └── components/                # Lit web components
├── docs/
│   └── vtmd/                          # VTMD format specification
├── .claude/
│   └── commands/
│       ├── feature.md                 # Agent workflow for features
│       └── architecture.md            # Architecture reference for agents
├── .tmp/                              # Temporary agent plan files (gitignored)
└── campaigns/                         # Your campaign data (VTMD files)
    └── example/
        ├── campaign.vtmd
        ├── characters/
        ├── npcs/
        └── modules/
```

---

## Dependency Rules

The architecture enforces a strict inward dependency direction:

```
UI → BLC → UseCases → Services → Repositories
```

- **UI** components only import from BLC facades
- **BLC** never imports anything from UI
- **Domain layers** never import from infrastructure directly
- **Repositories** are the only layer that knows about Tauri

---

## VTMD Format

Campaign documents use the `.vtmd` extension — an extended Markdown format specific to this application. Every file must declare its type on the first line:

```
# vtmd:character
# vtmd:chapter
# vtmd:module
# vtmd:npc
# vtmd:campaign
```

See [`docs/vtmd/`](./docs/vtmd/) for the full specification.

---

## Development Workflow

This project uses an agent-assisted development workflow. See [`.claude/commands/feature.md`](./.claude/commands/feature.md) for the required process when implementing new features.

All features must:
1. Have an approved plan in `.tmp/` before implementation
2. Include tests covering the cases defined in the plan
3. Pass all existing tests before merging

---

## License

MIT
