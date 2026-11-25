# Implementation Plan — CyberWar Simulation UI

> 25-step build order, 7 fase, dari scaffold sampai polish

---

## Bootstrap Commands

```bash
# Project sudah dibuat. Install Three.js + R3F + state (kalau belum):
npm install three @react-three/fiber @react-three/drei zustand framer-motion
npm install -D @types/three

# Dev server
npm run dev
```

**next.config.ts** — tambahan untuk Three.js:
```ts
const nextConfig = {
  transpilePackages: ['three'],
}
export default nextConfig
```

---

## Fase 1 — Foundation (Steps 1–5)

### Step 1: Styling + Design Tokens

**File:** `src/styles/globals.css`

```css
@import "tailwindcss";

@theme {
  /* ── JC Design System v1.0 ── */
  --color-ink:        #0B0F0E;
  --color-surface:    #121917;
  --color-line:       #1F2B27;
  --color-txt:        #D7E3DE;
  --color-muted:      #8FA39B;
  --color-signal:     #3DDC97;
  --color-purple:     #B79CFF;
  --color-warn:       #F2B84B;
  --color-danger:     #FF6B6B;
  --color-red-glow:   color-mix(in srgb, #FF6B6B 12%, transparent);
  --color-blue-glow:  color-mix(in srgb, #3DDC97 8%, transparent);
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-sans: "IBM Plex Sans", ui-sans-serif, system-ui;
  --radius-badge: 4px;
  --radius-btn:   8px;
  --radius-card:  16px;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px
  );
  pointer-events: none;
  z-index: 9999;
}

@keyframes flicker {
  0%, 100% { opacity: 1 }
  92% { opacity: 1 }
  93% { opacity: 0.97 }
  94% { opacity: 1 }
}

@keyframes arc-dash { to { stroke-dashoffset: -100 } }

@keyframes node-pulse {
  0%, 100% { box-shadow: 0 0 0 0 currentColor }
  50%       { box-shadow: 0 0 0 8px transparent }
}
```

---

### Step 2: TypeScript Types

**File:** `src/lib/types.ts`

Definisikan semua types:
- `Severity`, `LogPrefix`, `Team`, `KillPhase`, `CompPhase`, `DefStatus`, `ThreatLevel`, `SectorId`
- Interface: `SGTarget`, `IDAsset`, `Sector`, `LogEntry`, `Alert`, `C2Session`, `MitreEntry`, `IOC`

> Detail lengkap di [DATA_SCHEMA.md](./DATA_SCHEMA.md)

---

### Step 3: Master Data

**File:** `src/lib/sectorData.ts`

- `SG_TARGETS` — 6 target Singapura dengan koordinat geo + Vec3 + status compromise
- `SECTORS` — 8 sektor pertahanan Indonesia dengan icon + label
- `ID_ASSETS` — 20 aset Indonesia, masing-masing assign ke `sectorId`

> Detail lengkap di [DATA_SCHEMA.md](./DATA_SCHEMA.md)

---

### Step 4: Event Pool

**File:** `src/lib/eventPool.ts`

```ts
export const RED_EVENTS = [
  { prefix: '[*]', team: 'RED',   msg: 'Running nmap -sS on {target}',          tech: 'T1595' },
  { prefix: '[+]', team: 'RED',   msg: 'Port {port} open → {target}',           tech: 'T1046' },
  { prefix: '[!]', team: 'RED',   msg: '{cve} applicable on {target}',          tech: 'T1190' },
  { prefix: '[+]', team: 'RED',   msg: 'Session opened → {target}',             tech: 'T1078' },
  { prefix: '[+]', team: 'RED',   msg: 'PrivEsc successful — root on {target}', tech: 'T1068' },
  { prefix: '[*]', team: 'RED',   msg: 'Deploying persistence on {target}',     tech: 'T1053' },
  { prefix: '[+]', team: 'RED',   msg: 'Beacon live → C2 · {interval}s',       tech: 'T1071' },
  { prefix: '[+]', team: 'RED',   msg: 'Exfil {size}MB staged → dropzone',      tech: 'T1041' },
  { prefix: '[#]', team: 'INTEL', msg: 'Pivot path: {target} → {next}',        tech: 'T1021' },
  { prefix: '[-]', team: 'RED',   msg: 'Payload detected on {target} — evading',tech: 'T1562' },
] as const

export const BLUE_EVENTS = [
  { sev: 'HIGH',     msg: 'SYN Flood detected on {asset}',              rule: 'NET-1001' },
  { sev: 'CRITICAL', msg: 'Ransomware execution on {asset}',            rule: 'EDR-9001' },
  { sev: 'HIGH',     msg: 'SQLi attempt on {asset} web portal',         rule: 'WAF-4421' },
  { sev: 'MEDIUM',   msg: 'Brute force SSH: {asset} — {n} attempts',   rule: 'AUTH-2201'},
  { sev: 'HIGH',     msg: 'C2 beacon outbound from {asset}',            rule: 'NET-3301' },
  { sev: 'CRITICAL', msg: 'Lateral movement detected: {asset}',         rule: 'EDR-8801' },
  { sev: 'MEDIUM',   msg: 'Anomalous data transfer on {asset}',         rule: 'DLP-5501' },
  { sev: 'HIGH',     msg: 'Zero-day exploit attempt on {asset}',        rule: 'IPS-7701' },
  { sev: 'LOW',      msg: 'Port scan from SG ASN on {asset}',          rule: 'NET-1101' },
  { sev: 'CRITICAL', msg: 'Exfil attempt — {size}MB via DNS on {asset}',rule: 'DLP-5601'},
] as const
```

---

### Step 5: Three.js Helpers

**File:** `src/lib/threeHelpers.ts`

```ts
import * as THREE from 'three'

export function geoToVec3(lat: number, lng: number, radius = 2): THREE.Vector3 {
  const phi   = (90 - lat)  * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  )
}

// Koordinat kunci
// Indonesia (Jakarta): lat -6.2,  lng 106.8
// Singapore:           lat  1.3,  lng 103.8
```

---

## Fase 2 — State & Engine (Steps 6–7)

### Step 6: Zustand Store

**File:** `src/store/warStore.ts`

```ts
import { create } from 'zustand'
import { SG_TARGETS, ID_ASSETS, SECTORS } from '@/lib/sectorData'

// Interface WarState mencakup:
// Global: tick, threatLevel, conflictSeconds, redOpsActive, blueIncidents, exfilTotal, threatsBlocked
// Red Team: sgTargets, selectedTargetId, c2Sessions, activePhase
// Blue Team: idAssets, sectors, alerts, mitreData, iocs, activeSectorFilter
// Controls: firewallOn, idsOn, ipsOn, wafOn, edrOn, siemOn
// Shared: attackLog

// Actions:
// doTick() → main simulation tick, dipanggil setiap 2 detik
// selectTarget(id) → pilih target SG
// deployPayload(payload, targetId) → inject ke terminal + update state
// setPhase(phase) → update killchain phase
// setSectorFilter(id) → filter Blue Team per sektor
// deploySectorDef(id) → boost health sektor + cooldown 30s
// handleAlert(alertId, action) → respond alert
// toggleDefense(comp) → toggle fw/ids/ips/waf/edr/siem
// addIOC(ioc), addLog(entry)
```

**Logic doTick():**
1. `conflictSeconds += 2`
2. Random 1–3 RED events → update `sgTargets.compromisePercent`, tambah C2 sessions
3. Random 1–2 BLUE events → push ke `alerts` + `attackLog`
4. Update `idAssets.healthPercent` (turun kalau `underAttack && !defense`)
5. Update `mitreData.intensity` (naik/turun random)
6. Computed update `sectors` dari `idAssets`
7. Adjust `threatLevel` dari avg health semua assets
8. Trim `attackLog` ke max 100 entries

---

### Step 7: Simulation Engine

**File:** `src/lib/simEngine.ts`

```ts
export function startSimEngine(doTick: () => void): () => void {
  const id = setInterval(doTick, 2000)
  return () => clearInterval(id)   // cleanup function
}

// Usage di page.tsx:
// useEffect(() => {
//   const stop = startSimEngine(warStore.doTick)
//   return stop
// }, [])
```

---

## Fase 3 — Layout Shell (Steps 8–10)

### Step 8: Root Layout

**File:** `src/app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { ScanlineOverlay } from '@/components/layout/ScanlineOverlay'
import { ToastContainer } from '@/components/layout/ToastContainer'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'CyberWar.Sim',
  description: 'Indonesia vs Singapore Cyber War Simulation',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-ink">
      <body className="font-mono text-txt min-h-screen">
        <ScanlineOverlay />
        <Navbar />
        <main className="h-[calc(100vh-56px)]">
          {children}
        </main>
        <ToastContainer />
      </body>
    </html>
  )
}
```

### Step 9: Navbar

**File:** `src/components/layout/Navbar.tsx`

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWarStore } from '@/store/warStore'

export function Navbar() {
  const { tick, threatLevel, conflictSeconds } = useWarStore()
  // Format conflictSeconds → HH:MM:SS
  
  return (
    <nav className="flex items-center h-14 bg-surface border-b border-line px-4 font-mono text-sm">
      <span className="text-danger font-bold mr-8 tracking-widest">⬡ CYBERWAR.SIM</span>
      <NavLink href="/war-room">[ WAR ROOM ]</NavLink>
      <NavLink href="/red-team" activeClass="text-danger">[ RED TEAM ]</NavLink>
      <NavLink href="/blue-team" activeClass="text-signal">[ BLUE TEAM ]</NavLink>
      <div className="ml-auto flex items-center gap-6 text-xs text-muted">
        <span>{formatTime(conflictSeconds)}</span>
        <span className={threatLevel >= 4 ? 'text-danger' : 'text-warn'}>
          THREAT: {getThreatLabel(threatLevel)}
        </span>
        <span>TICK #{tick}</span>
        <span className="text-warn">[SIM ACTIVE ●]</span>
      </div>
    </nav>
  )
}
```

### Step 10: Root Page Redirect

**File:** `src/app/page.tsx`

```tsx
import { redirect } from 'next/navigation'
export default function Home() { redirect('/war-room') }
```

---

## Fase 4 — War Room (Steps 11–14)

### Step 11: ThreatGlobe — R3F 3D Globe

**File:** `src/components/three/ThreatGlobe.tsx`

```
Komponen: ThreatGlobeScene (default export)
├── Canvas (R3F) — camera: { position: [0,1.5,4], fov: 45 }
│   ├── ambientLight (intensity: 0.15)
│   ├── pointLight (position: [5,5,5])
│   ├── GlobeMesh — SphereGeometry radius=2, wireframe partial
│   ├── AttackArcs direction="outgoing" color="#FF6B6B" ← ID→SG
│   ├── AttackArcs direction="incoming" color="#3DDC97" ← SG→ID
│   ├── GlobeNodes — node per SG target, pulse on attack
│   ├── ParticleFlow — data stream particles
│   └── OrbitControls autoRotate speed=0.3 no zoom/pan
```

**Arc animation:**
- `QuadraticBezierCurve3` dari koordinat sumber ke tujuan
- Mid-point diangkat ke luar sphere (parabola effect)
- `TubeGeometry` dengan material `MeshBasicMaterial`
- `useFrame` → animasi `dashOffset` untuk motion effect

**geoToVec3 mapping:**
- SG targets: cluster ±0.3° dari koordinat Singapura (1.3, 103.8)
- ID assets: cluster ±1.0° dari Jakarta (-6.2, 106.8)

---

### Step 12: AttackFeed

**File:** `src/components/war-room/AttackFeed.tsx`

```
Shared log stream dari warStore.attackLog
- Auto-scroll ke bawah setiap tick
- Color coding per team: RED=danger, BLUE=signal, INTEL=purple, SYS=muted
- Format: [prefix] HH:MM:SS team » message
- Max tampil 50 entries, scroll untuk history
- Badge techniqueId kalau ada (T1595, dll)
```

---

### Step 13: War Room Supporting Components

**WarScoreBoard** (`src/components/war-room/WarScoreBoard.tsx`)
```
╔══════════════════════════════════╗
║  🇮🇩 INDONESIA  vs  🇸🇬 SINGAPORE ║
║  ─────────────────────────────── ║
║  RED OPS ACTIVE      7           ║
║  SG Assets Pwned     3 / 6       ║
║  Exfil Total         1.2 GB      ║
║  ─────────────────────────────── ║
║  BLUE INCIDENTS      12 open     ║
║  ID Assets Defended  14 / 20     ║
║  Threats Blocked     34          ║
╚══════════════════════════════════╝
```

**ThreatLevelGauge** (`src/components/war-room/ThreatLevelGauge.tsx`)
```
5 ████ CRITICAL ← active, pulse merah
4 ████ HIGH
3 ░░░░ ELEVATED
2 ░░░░ GUARDED
1 ░░░░ NORMAL
```

**ActiveOpsSummary** (`src/components/war-room/ActiveOpsSummary.tsx`)
```
[ RED OPS: 7 ● ]  [ BLUE INCIDENTS: 12 ⚠ ]  [ CONFLICT: 02:14:33 ]
      [▶ RED TEAM OPERATIONS]      [▶ BLUE TEAM OPERATIONS]
```

---

### Step 14: War Room Page Layout

**File:** `src/app/war-room/page.tsx`

```tsx
'use client'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useWarStore } from '@/store/warStore'
import { startSimEngine } from '@/lib/simEngine'

// WAJIB dynamic import ssr:false untuk R3F
const ThreatGlobe = dynamic(
  () => import('@/components/three/ThreatGlobe'),
  { ssr: false, loading: () => <GlobePlaceholder /> }
)

export default function WarRoomPage() {
  const doTick = useWarStore(s => s.doTick)
  
  useEffect(() => {
    const stop = startSimEngine(doTick)
    return stop
  }, [doTick])

  return (
    <div
      className="grid h-full gap-2 p-2"
      style={{
        gridTemplate: `
          "feed globe score" 1fr
          "feed globe gauge" auto
          "summary summary summary" 100px
          / 280px 1fr 260px
        `
      }}
    >
      <AttackFeed   style={{ gridArea: 'feed'    }} />
      <ThreatGlobe  style={{ gridArea: 'globe'   }} className="w-full h-full" />
      <WarScoreBoard style={{ gridArea: 'score'  }} />
      <ThreatLevelGauge style={{ gridArea: 'gauge' }} />
      <ActiveOpsSummary style={{ gridArea: 'summary' }} />
    </div>
  )
}
```

---

## Fase 5 — Red Team (Steps 15–19)

### Step 15: TargetBoard

**File:** `src/components/red-team/TargetBoard.tsx`

```
6 kartu target SG dalam grid 2×3:
Setiap kartu menampilkan:
- ID + nama target
- Sektor
- Phase badge (UNTOUCHED/RECON/FOOTHOLD/PIVOTING/EXFIL/OWNED)
- Progress bar compromise %
- C2 Sessions count + Exfil MB
- Button [SELECT TARGET ▶] → selectTarget(id)
Kartu terpilih: glow border danger, header highlight
```

### Step 16: KillChain

**File:** `src/components/red-team/KillChain.tsx`

```
Horizontal stepper 7 fase:
[RECON]──►[WEAPON]──►[DELIVER]──►[EXPLOIT]──►[INSTALL]──►[C2]──►[EXFIL]

- Fase sebelum activePhase: ✓ (completed, dim green)
- activePhase: ● (active, glow danger, animated pulse)
- Fase setelah activePhase: ○ (pending, muted)
- Klik fase → setPhase() + inject log ke terminal
- Per-target independent tracking
```

### Step 17: AttackTerminal

**File:** `src/components/red-team/AttackTerminal.tsx`

```
Pseudo-terminal dengan:
- Header: "ATTACK TERMINAL · [TARGET_ID] TargetName"
- Output area: dark bg, monospace, auto-scroll
- Cursor blink animasi
- Color: prefix [+]=signal, [-]=danger, [!]=warn, [*]=muted, [#]=purple
- Buttons: [CLEAR] [PAUSE SIM] [EXPORT LOG]
- Inject output baru setiap kali phase berubah atau payload deploy
```

### Step 18: C2Panel, PayloadSelector, ExfilTracker

**C2Panel** (`src/components/red-team/C2Panel.tsx`)
```
- Sessions counter: X active, Y beacons
- Per-session card: hostname, IP, target, last beacon time
- Buttons: [SHELL ▶] [PIVOT] [KILL]
- Dead session indicator (reconnecting...)
```

**PayloadSelector** (`src/components/red-team/PayloadSelector.tsx`)
```
9 payload tiles 3×3 grid:
SQLi Injector | RCE Module   | Spear Phishing
RAT Dropper   | DDoS Flood   | 0day Bundle
Keylogger     | Ransomware   | Backdoor.py

Status: LOADED / DEPLOYED / AVAILABLE / DETECTED
Klik → deployPayload(name, selectedTargetId)
```

**ExfilTracker** (`src/components/red-team/ExfilTracker.tsx`)
```
- Total staged vs transferred progress bar
- Per-dataset list: nama, ukuran, status (done/in-progress/pending)
- Update live dari warStore.exfilTotal
```

### Step 19: Red Team Page Layout

**File:** `src/app/red-team/page.tsx`

```tsx
<div
  className="grid h-full gap-2 p-2"
  style={{
    gridTemplate: `
      "targets terminal" 1fr
      "killchain killchain" 56px
      "c2 payload exfil" 200px
      / 1fr 1fr
    `
  }}
>
```

---

## Fase 6 — Blue Team (Steps 20–25)

### Step 20: NetworkGraph3D

**File:** `src/components/three/NetworkGraph3D.tsx`

```
8 cluster sektor melingkar di bidang XZ:
energy(0,-2.5) → transport(1.77,-1.77) → cctv(2.5,0) → finance(1.77,1.77)
→ government(0,2.5) → military(-1.77,1.77) → health(-2.5,0) → telco(-1.77,-1.77)

Setiap cluster:
- Label sektor (ikon + nama) sebagai Html dari drei
- Node per aset: SphereGeometry kecil (r=0.08)
- Node color: secure=#3DDC97, ok=#3DDC97(dim), warn=#F2B84B, critical=#FF6B6B
- underAttack → rotating ring (TorusGeometry) di sekeliling node
- Incoming threat arc dari arah SG (x:5, z:0) ke node yang diserang

SectorFilter aktif → non-selected cluster jadi translucent (opacity 0.2)
```

### Step 21: SectorDefensePanel

**File:** `src/components/blue-team/SectorDefensePanel.tsx`

```
8 kartu sektor vertikal (scrollable):
Per kartu:
- Icon + label + jumlah aset [3]
- Health bar % (computed avg dari assets di sektor)
- Under attack count + open incidents
- Status badge: SECURE/OK/WARN/CRITICAL
- Button [DEPLOY SECTOR DEFENSE] atau countdown "29s..."

Behavior:
- Klik kartu → setSectorFilter(sectorId) → highlight di NetworkGraph + filter alerts
- Klik [DEPLOY SECTOR DEFENSE] → deploySectorDef(id) → boost +10% health semua aset, cooldown 30s
- Kartu terpilih: highlighted border signal
```

### Step 22: AssetHealthBySektor

**File:** `src/components/blue-team/AssetHealthBySektor.tsx`

```
Tabs horizontal per sektor (8 tabs):
[⚡] [🚆] [📹] [💰] [🏛️] [⚔️] [🏥] [📡]

Content tab aktif:
Tabel per aset di sektor tersebut:
- Nama aset
- Health bar %
- Status badge
- Under attack indicator (animasi pulse merah)
- Open incidents count

Tab badge = jumlah incidents di sektor tersebut
Tab highlight = sektor dengan critical asset
```

### Step 23: AlertFeed

**File:** `src/components/blue-team/AlertFeed.tsx`

```
Filter bar: [ALL▼] [CRITICAL n] [HIGH n] [MEDIUM n] [LOW n]

Per alert card:
- Severity badge (color coded)
- Alert ID + title
- Asset name + sektor
- Source IP + rule ID
- Action buttons per severity:
  CRITICAL → [ISOLATE HOST] [ESCALATE]
  HIGH     → [INVESTIGATE] [BLOCK IP]
  MEDIUM   → [INVESTIGATE] [FALSE POS]
  LOW      → [MARK READ]

Klik action → handleAlert(alertId, action) + toast notification
Auto-scroll ke alert terbaru
```

### Step 24: Blue Team Supporting Components

**MitreHeatmap** (`src/components/blue-team/MitreHeatmap.tsx`)
```
Grouped by tactic (Recon, Initial Access, Execution, Persistence, Exfil)
Per technique: ID + nama + intensity bar (0-10) + level label
Live update dari mitreData di store
```

**IncidentResponse** (`src/components/blue-team/IncidentResponse.tsx`)
```
Grouped action buttons:
── NETWORK ──    [Block IP] [GeoBlock SG] [Rate Limit] [Honeypot]
── HOST ──       [Isolate Host] [Memory Dump] [Force Reboot] [Kill Process]
── RECOVERY ──   [Deploy Patch] [Restore Backup] [Failover] [Escalate BSSN]
Counter: "Actions taken this session: 34"
```

**FirewallStatus** (`src/components/blue-team/FirewallStatus.tsx`)
```
Toggle buttons: FW / IDS / IPS / WAF / EDR / SIEM / TI / SOAR
Active: green glow + "● ACTIVE"
Inactive: dim + "○ OFF" → trigger warning alert
```

**ThreatIntelFeed** (`src/components/blue-team/ThreatIntelFeed.tsx`)
```
Live IOC feed dari warStore.iocs
Per IOC: type badge (IP/domain/hash/url) + value + confidence + actor
Action: [ADD BLOCKLIST] [SINKHOLE] [ADD TO EDR] [REPORT]
```

### Step 25: Blue Team Page Layout

**File:** `src/app/blue-team/page.tsx`

```tsx
'use client'
import dynamic from 'next/dynamic'

const NetworkGraph = dynamic(
  () => import('@/components/three/NetworkGraph3D'),
  { ssr: false, loading: () => <GraphPlaceholder /> }
)

// Grid layout:
// alerts | graph    | sectors
// health | health   | health
// mitre  | ir       | ir
// fw     | fw       | intel
```

---

## Fase 7 — Polish (Steps 26–29)

### Step 26: Framer Motion Animations

```tsx
// Panel entry animation
const panelVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// Alert slide-in
const alertVariants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: 16 },
}

// Score count-up: useSpring dari framer-motion
// KillChain phase transition: layout animation
```

### Step 27: Toast Notifications

**File:** `src/components/layout/ToastContainer.tsx`

```
Trigger toast untuk:
- Payload deployed → [RED] "Payload X deployed on [target]"
- Sector defense deployed → [BLUE] "Sector ENERGI defense activated"
- Alert handled → [BLUE] "Alert #0031 → ISOLATING host BRI-DC-01"
- IOC added to blocklist → [INTEL] "IP 103.21.244.17 blocked"
- Defense toggled off → [WARN] "FW disabled — threat surface increased"

Auto-dismiss setelah 4 detik
Stack sampai 3 toast, yang lama slide out
```

### Step 28: Responsive Adjustments

```
Target viewport: min 1280px wide
- Navbar: collapse label jadi icon di <1280px
- War Room: hide ThreatLevelGauge di <1024px
- Red Team: stack C2/Payload/Exfil vertically di <1280px
- Blue Team: AssetHealthBySektor jadi accordion di <1280px
```

### Step 29: Performance Check

```
Checklist:
□ R3F perf: gunakan instancing untuk globe nodes
□ Zustand selector: gunakan selector per field, bukan spread state
□ attackLog: trim ke max 100 entries di setiap tick
□ useCallback pada semua event handler di komponen yang sering re-render
□ dynamic import untuk semua Three.js components (sudah dilakukan)
□ React.memo untuk komponen non-reactive (TargetBoard cards)
□ AnimatePresence hanya di container level, bukan per item kecil
```

---

## Build Order Checklist

```
Fase 1 — Foundation
  ☐  1. globals.css → @theme + keyframes + scanline
  ☐  2. types.ts → semua TypeScript interfaces
  ☐  3. sectorData.ts → SG_TARGETS + ID_ASSETS + SECTORS
  ☐  4. eventPool.ts → RED_EVENTS + BLUE_EVENTS
  ☐  5. threeHelpers.ts → geoToVec3()

Fase 2 — State & Engine
  ☐  6. warStore.ts → Zustand store + doTick logic
  ☐  7. simEngine.ts → startSimEngine()

Fase 3 — Layout Shell
  ☐  8. layout.tsx → root layout
  ☐  9. Navbar.tsx + ScanlineOverlay.tsx + ToastContainer.tsx
  ☐ 10. page.tsx → redirect /war-room

Fase 4 — War Room
  ☐ 11. ThreatGlobe.tsx → R3F globe + arcs + nodes + particles
  ☐ 12. AttackFeed.tsx → scrolling CLI log
  ☐ 13. WarScoreBoard.tsx + ThreatLevelGauge.tsx + ActiveOpsSummary.tsx
  ☐ 14. war-room/page.tsx → grid layout + SimEngine start

Fase 5 — Red Team
  ☐ 15. TargetBoard.tsx → 6 target cards
  ☐ 16. KillChain.tsx → 7-phase stepper
  ☐ 17. AttackTerminal.tsx → pseudo-terminal
  ☐ 18. C2Panel.tsx + PayloadSelector.tsx + ExfilTracker.tsx
  ☐ 19. red-team/page.tsx → grid layout

Fase 6 — Blue Team
  ☐ 20. NetworkGraph3D.tsx → 8 sector clusters
  ☐ 21. SectorDefensePanel.tsx → sector cards + filter + deploy
  ☐ 22. AssetHealthBySektor.tsx → tabs per sektor
  ☐ 23. AlertFeed.tsx → SOC alert stream
  ☐ 24. MitreHeatmap.tsx + IncidentResponse.tsx + FirewallStatus.tsx + ThreatIntelFeed.tsx
  ☐ 25. blue-team/page.tsx → grid layout

Fase 7 — Polish
  ☐ 26. Framer Motion → panel transitions + alert animations
  ☐ 27. Toast notifications → semua user actions
  ☐ 28. Responsive adjustments → min 1280px target
  ☐ 29. Perf check → instancing, selectors, memo, trim log
```

---

*CyberWar Simulation UI — Implementation Plan v1.0 — 2026*
