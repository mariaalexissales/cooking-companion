<div align="center">

# 🌙 Cooking Companion

### A local-first pantry tracker, built as a PWA

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

Cooking Companion is a pantry-tracking app built to solve a specific, recurring problem: knowing what we have on hand, what we're low on, and what to actually cook with it. _**ESPECIALLY**_ when you're standing in the middle of Sainsbury's trying to juggle whether or not the reduced pork should could even be cooked _today_.

Meal planning and grocery budgeting for two people gets harder when tracking pantry inventory isn't automatic for either of us. This app externalizes that tracking: instead of guessing whether we already have an ingredient, the answer is in the app, kept in sync with what's actually in the cupboard.

The name is a nod to our favorite [SnapCube](https://www.youtube.com/@SnapCube) Kingdom Hearts fandub. It's irrelevant to the overall design of the app, but we can only really remember him for _one_ thing...

The app is local-first by design: all data is stored on-device via IndexedDB, so there's no account, no server, and no data leaving the device it's used on.

---

## ⭐ Features

**Implemented**
- 🌌 Add pantry items with quantity and unit
- 💜 Favourite/pin items to surface the ones worth watching closely
- 🌙 Fully local persistence (IndexedDB via Dexie) — no backend, no account
- 📲 Installable as a PWA
- 📱 Responsive, mobile-first layout

**Planned**
- 🪐 Barcode scanning for faster item entry
- 🔭 Low-stock indicators for favourited items
- 🧠 LLM-based recipe suggestions generated from current pantry contents
- 🌠 Shared/multi-user view for household-level tracking

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| Framework | React 19 + TypeScript |
| Bundler | Vite |
| UI | Material UI (MUI) v9 |
| Local data | Dexie.js (IndexedDB) |
| Offline / installable | `vite-plugin-pwa` |
| Hosting | GitHub Pages, deployed via GitHub Actions |

---

## 🌙 Getting Started

```bash
# clone
git clone https://github.com/mariaalexissales/cooking-companion.git
cd cooking-companion

# install
npm install

# run locally
npm run dev
```

To test on a phone on the same network:

```bash
npm run dev -- --host
```

### Build for production

```bash
npm run build
```

Pushes to `main` deploy automatically to GitHub Pages via GitHub Actions.

---

## ✨ Project Direction

Cooking Companion is the first in a planned set of small, local-first utility apps designed around making life easier for me. Might call it the **IRL QoL Mod Collection**, but I'm pretty sure I'm not the first one to come up with something quirky like that.
