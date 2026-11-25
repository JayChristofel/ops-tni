# CyberWar Simulation UI

> Simulasi operasi siber antara Indonesia dan Singapura — real-time war room, red team offensive dashboard, dan blue team defense command center.

---

## 🎯 Overview

**CyberWar Sim** adalah full-stack simulation UI yang mensimulasikan perang siber antara Indonesia (tim penyerang & defender) vs Singapura (target). Dibangun dengan terminal-first dark aesthetic menggunakan JC Design System v1.0.

### Halaman

| Halaman | Route | Peran |
|---------|-------|-------|
| **War Room** | `/war-room` | Global Command Center — threat map 3D, attack feed, scoreboard |
| **Red Team Ops** | `/red-team` | Offensive dashboard — attack SG infrastructure |
| **Blue Team Ops** | `/blue-team` | Defensive dashboard — protect Indonesia by 8 sectors |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 (CSS-first, `@theme`) |
| 3D Engine | Three.js via `@react-three/fiber` v9 + `@react-three/drei` v10 |
| State | Zustand v5 |
| Animation | Framer Motion v11 |
| Language | TypeScript 5 |

---

## 📁 Project Structure

```
cyberwar-sim/
├── docs/                        ← semua dokumentasi (.md)
│   ├── README.md                ← dokumen ini
│   ├── IMPLEMENTATION_PLAN.md   ← 25-step build order
│   ├── ARCHITECTURE.md          ← arsitektur teknis & data flow
│   ├── DESIGN_SYSTEM.md         ← JC Design System v1.0
│   ├── DATA_SCHEMA.md           ← TypeScript types + master data
│   └── COMPONENTS.md            ← semua komponen per halaman
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             ← redirect → /war-room
│   │   ├── war-room/page.tsx
│   │   ├── red-team/page.tsx
│   │   └── blue-team/page.tsx
│   │
│   ├── components/
│   │   ├── layout/              ← Navbar, ScanlineOverlay, ToastContainer
│   │   ├── three/               ← ThreatGlobe, NetworkGraph3D, dll
│   │   ├── war-room/            ← AttackFeed, WarScoreBoard, dll
│   │   ├── red-team/            ← TargetBoard, KillChain, dll
│   │   └── blue-team/           ← AlertFeed, SectorDefensePanel, dll
│   │
│   ├── store/
│   │   └── warStore.ts          ← Zustand global state
│   │
│   ├── lib/
│   │   ├── types.ts             ← semua TypeScript interfaces
│   │   ├── sectorData.ts        ← SG targets + ID assets master data
│   │   ├── simEngine.ts         ← simulation tick engine
│   │   ├── eventPool.ts         ← random event templates
│   │   └── threeHelpers.ts      ← geoCoord → Vec3 utils
│   │
│   └── styles/
│       └── globals.css          ← Tailwind v4 @theme + JC DS tokens
│
├── next.config.ts
├── postcss.config.mjs
└── package.json
```

---

## ⚡ Quick Start

```bash
# Install dependencies (sudah ada di project ini)
npm install

# Run dev server
npm run dev
# → http://localhost:3000 (auto redirect ke /war-room)

# Build production
npm run build
npm start
```

---

## 📚 Dokumentasi

- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** — 25-step build order, 7 fase
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — sistem arsitektur, data flow, state management
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** — JC DS v1.0, color tokens, typography, komponen
- **[DATA_SCHEMA.md](./DATA_SCHEMA.md)** — TypeScript types, master data 20 aset + 8 sektor
- **[COMPONENTS.md](./COMPONENTS.md)** — UI spec semua komponen per halaman

---

## 🎨 Design Philosophy

- **Terminal-first dark aesthetic** — CRT scanline overlay, monospace font, CLI-style log feeds
- **Signal over noise** — 4 neutral + 4 signal colors, hanya warna yang bermakna
- **Real-time simulation** — `setInterval` tick setiap 2 detik, semua panel update live
- **Sector-based defense** — 20 aset Indonesia diorganisir ke 8 sektor pertahanan

---

## ⚠️ Notes

- Semua Three.js Canvas components **wajib** pakai `dynamic import` dengan `ssr: false`
- Tailwind v4: tidak ada `tailwind.config.js`, semua di `@theme` dalam `globals.css`
- Target viewport minimum: **1280px wide**
- Simulasi berjalan di client-side saja, tidak ada backend/API

---

*CyberWar Simulation UI — JC Design System v1.0 — 2026*
