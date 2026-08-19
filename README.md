# Things Replica

A standalone, Things 3-inspired to-do app for **Windows**. Built with React + TypeScript,
packaged as a native desktop app with [Tauri](https://tauri.app), and stored 100% locally
(no account, no cloud, no internet required).

## Why standalone?

This was originally scoped as "sync with the real Things 3 app on iPhone," but
[Things Cloud](https://culturedcode.com/things/cloud/) (Culturedcode's sync service) has no
public API, so a third-party Windows app can't reliably read or write to it. This app is a
fully independent local-first replica — it does not talk to Things Cloud or the real Things 3
app in any way.

## Features (MVP)

- Smart lists: **Inbox, Today, Upcoming, Anytime, Someday, Logbook, Trash**
- **Areas** containing **Projects**, plus standalone to-dos
- **Tags**, multi-assignable, with a quick-create picker
- To-dos support: notes, checklists, a "When" date (+ This Evening), a separate red **Deadline**,
  project/area assignment, tags
- Drag-to-reorder within any list
- Quick entry: press `N` (or `Ctrl+N` / `Cmd+N`) anywhere to add a to-do to the Inbox
- Inline quick-add row at the top of every list
- All data stored locally in the app (IndexedDB via Dexie) — works fully offline

## Tech stack

- React 19 + TypeScript + Vite
- [Tauri 2](https://tauri.app) — native Windows shell (small binary, uses the OS's built-in
  WebView2 runtime rather than bundling Chromium like Electron does)
- [Dexie](https://dexie.org) (IndexedDB) for local storage
- Zustand for UI state, @dnd-kit for drag-and-drop, Tailwind CSS for styling

## Running it

### Option A — Build on your Windows machine

Requires [Node.js](https://nodejs.org) and the
[Rust toolchain](https://www.rust-lang.org/tools/install) (WebView2 is already installed on
Windows 10/11).

```bash
npm install
# ^ also regenerates src-tauri/icons/icon.ico from its committed base64 form
#   (scripts/setup-icons.mjs runs automatically via "postinstall"). If your
#   environment skips postinstall scripts, run it manually:
#   node scripts/setup-icons.mjs

# Dev mode (hot reload, opens a native window)
npm run tauri dev

# Production build — outputs an installer to
# src-tauri/target/release/bundle/msi/*.msi (and /nsis/*.exe)
npm run tauri build
```

### Option B — Let GitHub Actions build the installer for you

This repo includes `.github/workflows/build-windows.yml`, which builds the app on a
`windows-latest` GitHub runner on every push to `main`. After a run finishes, download the
`things-replica-windows` artifact from the workflow run's **Artifacts** section — it contains
the `.msi` installer, no local Rust/Node setup required. You can also trigger it manually from
the **Actions** tab (`Run workflow`).

## Project layout

```
src/
  db/            Dexie schema, TypeScript types, and all CRUD actions
  lib/            Date helpers and smart-list membership logic
  store/          Zustand UI state (current view, selected task, etc.)
  components/     Sidebar, task list/rows, pickers (When/Deadline/Tags/Project), quick entry
src-tauri/        Tauri (Rust) shell — window config, bundler targets, icons
```

## Data storage

All data lives in the app's local IndexedDB store (inside the Tauri webview's local storage),
scoped to this app only. There's no export/import or backup step yet — worth keeping in mind
before relying on this for anything critical.
