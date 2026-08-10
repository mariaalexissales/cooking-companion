<div align="center">

# 🌙 Cooking Companion

### A local-first pantry, fridge and recipe companion, built as a PWA

[![Made with React](https://img.shields.io/badge/React-19-1A1B26?style=for-the-badge&logo=react&logoColor=8A63D2&labelColor=1A1B26)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-1A1B26?style=for-the-badge&logo=typescript&logoColor=9B59B6&labelColor=1A1B26)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-1A1B26?style=for-the-badge&logo=vite&logoColor=6C3FC9&labelColor=1A1B26)](https://vitejs.dev)
[![PWA](https://img.shields.io/badge/PWA-ready-8A63D2?style=for-the-badge&labelColor=1A1B26)](https://web.dev/progressive-web-apps/)
[![Version](https://img.shields.io/github/package-json/v/mariaalexissales/cooking-companion?style=for-the-badge&color=9B59B6&labelColor=1A1B26)](https://github.com/mariaalexissales/cooking-companion/blob/main/package.json)
[![Deploy](https://img.shields.io/github/actions/workflow/status/mariaalexissales/cooking-companion/deploy.yml?style=for-the-badge&color=6C3FC9&labelColor=1A1B26&label=deploy&logo=githubactions&logoColor=white)](https://github.com/mariaalexissales/cooking-companion/actions/workflows/deploy.yml)

✨ [**Live app**](https://mariaalexissales.github.io/cooking-companion/) ✨

</div>

---

## 🔭 Overview

Cooking Companion tracks what we have on hand, what's about to go off, and what to actually cook with it. _**ESPECIALLY**_ when you're standing in the middle of Sainsbury's trying to juggle whether or not the reduced pork should could even be cooked _today_.

Meal planning and grocery budgeting for two people gets harder when tracking pantry inventory isn't automatic for either of us. This app externalizes that tracking: instead of guessing whether we already have an ingredient, the answer is in the app, kept in sync with what's actually in the cupboard.

The name is a nod to our favorite [SnapCube](https://www.youtube.com/@SnapCube) Kingdom Hearts fandub. It's irrelevant to the overall design of the app, but we can only really remember him for _one_ thing...

Inventory is local-first: everything lives in on-device IndexedDB, with no account and no sync. The only thing that leaves the device is the ingredient list you explicitly send to the recipe generator.

---

## ⭐ Features

- 🌌 **Pantry** — cupboard staples with quantity and unit, favourites pinned to the top, inline quantity editing, and a merge prompt when you add something you already have
- ❄️ **Refrigerator** — the same, plus expiry dates, sorted so whatever goes off first is at the top. Expired and about-to-expire items get flagged, and the count shows as a badge on the nav
- 📖 **Saved recipes** — keep the generated recipes worth repeating; ingredients you don't currently have are marked so you know what to buy
- 🧠 **Recipe generator** — Google AI Studio (Gemini) writes a recipe from whatever you select, prioritising things that are about to expire
- 🎨 **Six themes** — Umineko, Estral and Classic, each in light and dark
- 📲 Installable as a PWA, mobile-first, works offline for everything except generation

**Planned**
- 🪐 Barcode scanning for faster item entry
- 🔭 Low-stock indicators for favourited items
- 🌠 Shared/multi-user view for household-level tracking

---

## 🎨 Themes

Pick a family and a mode in **Settings**; the choice persists in `localStorage`, and a first-time visit follows your OS dark-mode preference.

| Theme | Dark | Light |
|---|---|---|
| **Umineko** | Bordeaux and gold — a candlelit dining hall | Parchment and deep bordeaux — an old page |
| **Estral** | Daemon violet on near-black, IBM Plex Mono, scanline overlay | The same system as a printed record, with ruled lines instead of scanlines |
| **Classic** | Plain neutral dark | Plain neutral light |

Every foreground/background pair in all six palettes clears WCAG AA (4.5:1).

Themes live in `src/theme/`: `tokens.ts` holds the six token sets, `themes.ts` turns each into a MUI theme with its own typography and component overrides, and `ThemeController.tsx` handles selection and persistence.

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| Framework | React 19 + TypeScript |
| Bundler | Vite |
| UI | Material UI (MUI) v9 |
| Routing | React Router (hash routing, for GitHub Pages) |
| Local data | Dexie.js (IndexedDB) |
| AI | Google AI Studio (Gemini), behind a Cloudflare Worker |
| Offline / installable | `vite-plugin-pwa` |
| Hosting | GitHub Pages, deployed via GitHub Actions |

---

## 🌙 Getting Started

```bash
git clone https://github.com/mariaalexissales/cooking-companion.git
cd cooking-companion
npm install
npm run dev
```

To test on a phone on the same network:

```bash
npm run dev -- --host
```

The app runs fine without the generator configured — the Generate screen just tells you it isn't connected.

---

## 🧠 Recipe generator setup

The Gemini API key **cannot** live in the app. This is a static site: anything built into the bundle, including a `VITE_` variable injected from a GitHub Actions secret, ships to every visitor in plain JavaScript. A GitHub secret protects the key in the repo, not in the shipped code.

So the key lives in a Cloudflare Worker instead. The app calls the Worker, the Worker calls Google. The Worker URL is public — that part is fine, it's just an endpoint — but the key never leaves Cloudflare, and anyone with the app installed can generate recipes without needing a key of their own.

**One-time setup:**

```bash
npx wrangler login
```

```bash
npm run worker:secret
```

That prompts for the key from [Google AI Studio](https://aistudio.google.com/apikey) and stores it as a Cloudflare secret.

```bash
npm run worker:deploy
```

Wrangler prints the deployed URL. Put it in two places:

1. `.env.local` for local development (copy `.env.example` and edit):
   ```
   VITE_RECIPE_API_URL=https://cooking-companion-recipes.<your-subdomain>.workers.dev
   ```
2. A GitHub Actions **repository variable** named `VITE_RECIPE_API_URL`, under Settings → Secrets and variables → Actions → Variables. The deploy workflow reads it at build time.

Then edit `ALLOWED_ORIGINS` in `worker/wrangler.toml` so it lists your Pages origin, and redeploy the Worker.

**To run the Worker locally**, put the key in `worker/.dev.vars` (git-ignored):

```bash
npm run worker:dev
```

### What this does and doesn't protect

The Worker URL is public and CORS only stops *browsers* from other origins — it does nothing against `curl`. For a personal app that's proportionate, and it's a large improvement over a readable key. If it ever gets hit, the options are a Cloudflare rate-limiting rule on the route, or a shared token in a request header that the Worker checks. The Worker already caps request size, ingredient count and note length.

---

### Build for production

```bash
npm run build
```

Pushes to `main` deploy automatically to GitHub Pages via GitHub Actions. The workflow lints, type-checks (via `tsc -b`) and builds before publishing.

---

## ✨ Project Direction

Cooking Companion is the first in a planned set of small, local-first utility apps designed around making life easier for me. Might call it the **IRL QoL Mod Collection**, but I'm pretty sure I'm not the first one to come up with something quirky like that.
