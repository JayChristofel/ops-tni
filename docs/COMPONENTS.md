# Components — UI Specification

> Spesifikasi lengkap setiap komponen UI di tiga halaman, beserta layout grid dan interaksi.

---

## Layout Shell

### `src/app/layout.tsx`

```
┌──────────────────────────────────────────────────────┐
│  Navbar (h-12, sticky top-0 z-50)                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  {children}  (height: calc(100vh - 48px))            │
│                                                      │
└──────────────────────────────────────────────────────┘
│  ToastContainer (fixed bottom-4 right-4 z-50)        │
└──────────────────────────────────────────────────────┘
```

**Children dibungkus:**
```tsx
<html lang="id" className="bg-ink text-txt">
  <body className="font-sans antialiased">
    <Navbar />
    <main className="h-[calc(100vh-48px)] overflow-hidden">
      {children}
    </main>
    <ToastContainer />
  </body>
</html>
```

---

### `src/components/layout/Navbar.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ [⚔]  CYBERWAR SIM    │  WAR ROOM  RED TEAM  BLUE TEAM  │  LIVE 🔴 │
│       text-danger    │  nav links (active=signal)       │  #0042  │
└─────────────────────────────────────────────────────────────────┘
```

**Detail:**
- Height: `h-12` (48px)
- Background: `bg-surface/80 backdrop-blur-sm border-b border-line`
- Logo: `font-mono font-bold text-danger` — prefix `[⚔]`
- Nav links: `font-mono text-sm`, active route = `text-signal border-b-2 border-signal`
- LIVE badge: `bg-danger/20 text-danger border border-danger/40 rounded px-2 py-0.5 text-xs font-mono animate-pulse`
- Tick counter: `text-muted text-xs font-mono` — format `#0042`

---

### `src/components/layout/ToastContainer.tsx`

```
Fixed bottom-right stack (gap-2):
┌────────────────────────────────┐
│ [!] Sector ENERGI — DISERANG   │  ← danger variant
└────────────────────────────────┘
┌────────────────────────────────┐
│ [+] Sector TELKO defense aktif │  ← success variant
└────────────────────────────────┘
```

**Framer Motion AnimatePresence** untuk masuk/keluar:
- Entry: `y: 20 → 0, opacity: 0 → 1`
- Exit: `y: -10, opacity: 0`
- Auto-dismiss: 4 detik
- Max stack: 4 toasts

---

## Halaman 1 — War Room

**File:** `src/app/war-room/page.tsx`

**Grid layout:**
```
┌───────────────┬────────────────────────┬───────────────┐
│  AttackFeed   │   ThreatGlobe (3D)     │  Scoreboard   │
│  (w-72)       │   (flex-1, h-full)     │  (w-72)       │
│               │                        │               │
│  scrollable   │   Three.js Canvas      │   stats grid  │
│  log stream   │                        │               │
└───────────────┴────────────────────────┴───────────────┘
```

```tsx
<div className="flex h-full gap-4 p-4">
  <AttackFeed className="w-72 shrink-0" />
  <div className="flex-1 relative">
    <ThreatGlobe />        {/* dynamic import, ssr: false */}
    <ThreatLevelOverlay /> {/* absolute top-4 left-4 */}
  </div>
  <Scoreboard className="w-72 shrink-0" />
</div>
```

---

### `src/components/war-room/AttackFeed.tsx`

**Fungsi:** Stream log serangan real-time dari `attackLog[]`

```
┌─────────────────────────────────────┐
│ ◉ ATTACK FEED                       │
│ ─────────────────────────────────── │
│ [00:01:23] [RED]   Port scan pada   │
│            PLN Grid Jawa ...        │
│ [00:01:21] [BLUE]  Alert kritis:    │
│            Changi ATC compromise    │
│ [00:01:19] [INTEL] 23 endpoint...   │
│ ...                                 │
└─────────────────────────────────────┘
```

**Spec:**
- Max 100 entries (dari store)
- Auto-scroll ke bawah saat ada entry baru (`useEffect + ref.scrollTop`)
- Color per team: RED=danger, BLUE=signal, INTEL=purple, SYS=muted, C2=danger
- Timestamp format: `HH:MM:SS` dari `new Date(ts).toLocaleTimeString()`
- Entry baru: Framer Motion `variants` dengan `y: -4 → 0` per item

---

### `src/components/three/ThreatGlobe.tsx`

**Fungsi:** Globe 3D dengan attack arc Indonesia ↔ Singapore

```
'use client'  ← WAJIB
// Juga wajib dynamic import ssr: false di parent page
```

**Three.js scene tree:**
```
<Canvas camera={{ position: [0, 1.5, 4], fov: 45 }}>
  <ambientLight intensity={0.15} />
  <pointLight position={[5,5,5]} intensity={0.3} />
  
  <GlobeMesh />               ← sphere + wireframe overlay
  <AttackArcs team="red" />   ← arcs Jakarta→SG (merah)
  <AttackArcs team="blue" />  ← arcs SG→Jakarta (hijau)
  <GlobeNodes />              ← titik per sgTarget
  <ParticleField />           ← ambient particles
  
  <OrbitControls
    enableZoom={false}
    enablePan={false}
    autoRotate
    autoRotateSpeed={0.3}
    minPolarAngle={Math.PI/4}
    maxPolarAngle={Math.PI * 0.75}
  />
</Canvas>
```

**GlobeMesh:**
- `SphereGeometry(2, 64, 64)` + `MeshPhongMaterial({ color: '#0B2A1F', wireframe: false })`
- Wireframe overlay: `SphereGeometry(2.001, 32, 32)` + `MeshBasicMaterial({ wireframe: true, color: '#1F2B27', opacity: 0.3, transparent: true })`

**AttackArcs:**
- Baca `sgTargets` dari store
- Origin: random dari `JAKARTA_ATTACK_ORIGINS[]`
- Dest: `geoToVec3(target.geoCoord.lat, target.geoCoord.lng, 2)`
- Curve: `QuadraticBezierCurve3(start, arcMidpoint(start, end, 1.4), end)`
- Tube: `TubeGeometry(curve, 20, 0.004, 4, false)`
- Animation: `useFrame(({ clock }) => { mat.dashOffset = -clock.getElapsedTime() * 0.5 })`

**GlobeNodes:**
- Per sgTarget yang `underAttack`: ring berputar `useFrame(state => { ring.rotation.z += 0.02 })`
- Label: `Html` dari `@react-three/drei` dengan `distanceFactor={8}`

---

### War Room — `ThreatLevelOverlay`

```
Absolute overlay di sudut kiri atas globe:
┌──────────────────────────────┐
│ THREAT LEVEL                 │
│ ████████████░░░░  LEVEL 3    │
│ 🔴 Sulawesi | 🔴 Kalimantan  │
└──────────────────────────────┘
```

**Detail:**
- `position: absolute top-4 left-4`
- Background: `bg-surface/70 backdrop-blur-sm border border-line rounded-lg p-3`
- Bar: warna berdasarkan level (1-2: signal, 3: warn, 4-5: danger)

---

### `src/components/war-room/Scoreboard.tsx`

**Fungsi:** Live stats panel (kanan globe)

```
┌────────────────────────────┐
│ ◉ SCOREBOARD               │
│ ──────────────────────     │
│ EXFIL TOTAL                │
│        4.7 GB              │
│                            │
│ THREATS BLOCKED            │
│           23               │
│                            │
│ ACTIVE C2 SESSIONS         │
│            7               │
│                            │
│ ASSETS COMPROMISED         │
│            2 / 20          │
│ ─────────────────────────  │
│ ▪ PLN Grid Jawa      42%   │
│ ▪ BSSN NOC            7%   │
└────────────────────────────┘
```

**Detail:**
- Stats grid: `grid grid-cols-1 gap-4`
- Big number: `text-3xl font-mono font-bold`
- Color berdasarkan nilai (tinggi = danger, rendah = signal)
- Compromised list: hanya tampil kalau ada asset dengan status 'compromised'

---

## Halaman 2 — Red Team

**File:** `src/app/red-team/page.tsx`

**Grid layout:**
```
┌──────────────────────┬────────────────────────────────┐
│  TargetBoard         │  KillChainStepper              │
│  (40%)               │  (60%)                         │
│  - 6 target cards    │  - 7 phase stepper             │
│  - filter by status  │  - phase detail + action       │
├──────────────────────┼────────────────────────────────┤
│  C2SessionPanel      │  PayloadPanel / ExfilPanel     │
│  (40%)               │  (60%) — tab switch            │
└──────────────────────┴────────────────────────────────┘
```

```tsx
<div className="grid grid-cols-5 h-full gap-4 p-4">
  <div className="col-span-2 flex flex-col gap-4">
    <TargetBoard />
    <C2SessionPanel />
  </div>
  <div className="col-span-3 flex flex-col gap-4">
    <KillChainStepper />
    <div className="flex gap-2 items-center">
      <button onClick={() => setTab('payload')}>PAYLOAD</button>
      <button onClick={() => setTab('exfil')}>EXFIL</button>
    </div>
    {tab === 'payload' ? <PayloadPanel /> : <ExfilPanel />}
  </div>
</div>
```

---

### `src/components/red-team/TargetBoard.tsx`

**Fungsi:** Grid 6 SG target cards dengan select

```
┌─────────────────────────────────────────────┐
│ ◉ TARGET BOARD                              │
│ ─────────────────────────────────────────── │
│ ┌──────────────┐  ┌──────────────┐          │
│ │ CAAS – ATC   │  │ MAS – FAST   │          │
│ │ transport    │  │ finance      │          │
│ │ ████░░  43%  │  │ ░░░░░░   0%  │          │
│ │ 🔴 ATTACKING │  │ ⚪ SECURE    │          │
│ └──────────────┘  └──────────────┘          │
│ ┌──────────────┐  ┌──────────────┐          │
│ │ ...          │  │ ...          │          │
└─────────────────────────────────────────────┘
```

**Detail:**
- Grid: `grid grid-cols-2 gap-3`
- Card selected: `border-danger/60 bg-danger/5`
- Card default: `border-line bg-surface`
- `onClick`: `selectTarget(target.id)`
- Compromise bar: warna merah `bg-danger`
- Status badge: ATTACKING (animate-pulse) / SECURE / BREACHED

---

### `src/components/red-team/KillChainStepper.tsx`

**Fungsi:** 7-step Cyber Kill Chain dengan phase detail

```
┌─────────────────────────────────────────────────────────────┐
│ ◉ CYBER KILL CHAIN        Target: CAAS – Changi ATC         │
│ ─────────────────────────────────────────────────────────── │
│ [RECON] ──► [WEAPONIZE] ──► [DELIVER] ──► [EXPLOIT] ──►    │
│  ✓ done       ✓ done          ✓ done      ● ACTIVE          │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ EXPLOITATION                                            │ │
│ │ Trigger vulnerability, gain initial access              │ │
│ │                                                         │ │
│ │ [EXECUTE PHASE]                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│         ──► [INSTALL] ──► [C2] ──► [EXFIL]                 │
└─────────────────────────────────────────────────────────────┘
```

**Detail:**
- Stepper: `flex gap-2 items-center` horizontal
- Completed step: `text-signal bg-signal/10 border-signal/40`
- Active step: `text-danger bg-danger/10 border-danger/40 animate-pulse`
- Pending step: `text-muted bg-line border-line`
- Phase detail card: fade-in `AnimatePresence` saat phase berubah
- Button: `[EXECUTE PHASE]` trigger `setPhase(next)`

---

### `src/components/red-team/C2SessionPanel.tsx`

**Fungsi:** Live C2 session monitor

```
┌─────────────────────────────────────────────┐
│ ◉ C2 SESSIONS  [7 ACTIVE]                  │
│ ─────────────────────────────────────────── │
│ ● CAAS–ATC   dns   2m 34s   12.3 KB        │
│ ● MAS–FAST   http  0m 44s    2.1 KB        │
│ ● EMA–Grid   tcp   5m 01s   87.0 KB        │
└─────────────────────────────────────────────┘
```

**Detail:**
- Tiap row: `flex justify-between items-center py-1.5 border-b border-line/50`
- Status dot: `w-2 h-2 rounded-full bg-danger animate-pulse`
- Protocol badge: `font-mono text-xs text-purple`
- Duration: `font-mono text-xs text-muted`
- Data: `font-mono text-xs text-signal`

---

### `src/components/red-team/PayloadPanel.tsx`

**Fungsi:** Daftar payload tersedia + deploy ke selected target

```
┌─────────────────────────────────────────────┐
│ ◉ PAYLOAD MANAGER                           │
│ ─────────────────────────────────────────── │
│ ┌───────────────────────────────────────┐   │
│ │ SingSlayer.exe  ransomware  45KB  ★★★★★ │  │
│ │ [DEPLOY TO TARGET]                    │   │
│ └───────────────────────────────────────┘   │
│ ┌───────────────────────────────────────┐   │
│ │ BackdoorNG.sh   backdoor   12KB  ★★★★☆ │  │
│ │ [DEPLOY TO TARGET]                    │   │
│ └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Detail:**
- Deploy button: disabled kalau `selectedTargetId === null`
- On deploy: `addLog({ team: 'RED', msg: 'Payload deployed: ...' })` + `addToast`

---

### `src/components/red-team/ExfilPanel.tsx`

**Fungsi:** Monitor data exfiltration per target

```
┌─────────────────────────────────────────────┐
│ ◉ EXFILTRATION STATUS                       │
│ ─────────────────────────────────────────── │
│ CAAS–ATC   ████████░░  450 MB  ACTIVE      │
│ MAS–FAST   ██░░░░░░░░   22 MB  ACTIVE      │
│ EMA–Grid   ░░░░░░░░░░    0 MB  DORMANT     │
│ ...                                         │
│ ─────────────────────────────────────────── │
│ TOTAL EXFIL: 4.7 GB                        │
└─────────────────────────────────────────────┘
```

---

## Halaman 3 — Blue Team

**File:** `src/app/blue-team/page.tsx`

**Grid layout:**
```
┌──────────────────────┬────────────────────────────────┐
│  NetworkGraph3D      │  SectorDefensePanel            │
│  (50%, h-[55%])      │  (50%)                         │
│  R3F network viz     │  8 sector tabs + deploy        │
├──────────────────────┼────────────────────────────────┤
│  MITRE Heatmap       │  AlertFeed                     │
│  (50%, h-[45%])      │  (50%)                         │
│  ATT&CK bars         │  SOC alert queue               │
└──────────────────────┴────────────────────────────────┘
```

```tsx
<div className="grid grid-cols-2 h-full gap-4 p-4">
  <div className="flex flex-col gap-4">
    <div className="flex-1 min-h-0">
      <NetworkGraph3D />     {/* dynamic import, ssr: false */}
    </div>
    <MitreHeatmap className="h-[200px]" />
  </div>
  <div className="flex flex-col gap-4">
    <SectorDefensePanel className="flex-1" />
    <AlertFeed className="h-[280px]" />
  </div>
</div>
```

---

### `src/components/three/NetworkGraph3D.tsx`

**Fungsi:** Network graph 3D 20 ID assets dalam 8 cluster sector

```
'use client'  ← WAJIB
```

**Scene tree:**
```
<Canvas camera={{ position: [0, 5, 0], fov: 60 }}>
  <ambientLight intensity={0.2} />
  
  {SECTORS.map(sector => (
    <SectorCluster
      key={sector.id}
      position={[sector.clusterPos.x, 0, sector.clusterPos.z]}
      sector={sector}
    />
  ))}
  
  <OrbitControls enableZoom enablePan />
</Canvas>
```

**SectorCluster:**
- `Html` label (icon + nama sektor) di center
- Asset nodes dalam radius kecil (~0.4 unit) sekitar cluster center
- ThreatEdge dari SG (posisi `x:5, z:0`) ke node yang `underAttack`

**AssetNode:**
- `SphereGeometry(0.08)` + `MeshStandardMaterial`
- Color: secure=signal, ok=signal dim, warn=warn, critical=danger
- `underAttack`: RingGeometry ring berputar (useFrame)
- `Html` tooltip on hover: nama asset + health%

**onClick pada node**: panggil `setSectorFilter(asset.sectorId)`

---

### `src/components/blue-team/SectorDefensePanel.tsx`

**Fungsi:** 8 sector tabs dengan defense deploy per sector

```
┌─────────────────────────────────────────────────────┐
│ ◉ SECTOR DEFENSE                                    │
│ ─────────────────────────────────────────────────── │
│ [⚡ ENERGI] [🚢 TRANS] [📷 CCTV] [🏦 UANG] [+4]   │
│ ─────────────────────────────────────────────────── │
│ SEKTOR: ENERGI                   avg health: 72%    │
│ ─────────────────────────────────────────────────── │
│ ┌─────────────────────────────────────────────────┐ │
│ │ PLN – Grid Kontrol Jawa                         │ │
│ │ ████████░░  72%  ⚠ UNDER ATTACK               │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ Pertamina – SCADA Pipeline                      │ │
│ │ ██████████ 100%  ✓ SECURE                      │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ PLN – Distribusi Sulawesi                       │ │
│ │ ████░░░░░░  38%  🔴 CRITICAL                   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [DEPLOY SECTOR DEFENSE]  Cooldown: 30s             │
└─────────────────────────────────────────────────────┘
```

**Detail:**
- Tab pills: scroll horizontal kalau overflow
- Active tab: `border-b-2 border-signal text-signal`
- Asset list: `divide-y divide-line`
- Health bar: warna dinamis (signal/warn/danger)
- Deploy button: `deploySectorDef(activeSector)` → disabled kalau cooldown aktif
- Cooldown display: countdown dari `sector.defenseDeployedAt + 30000 - Date.now()`
- `setInterval(1000)` untuk update countdown lokal

---

### `src/components/blue-team/AssetHealthBySektor.tsx`

**Sub-komponen** dari SectorDefensePanel (atau standalone).

**Tiap asset row:**
```tsx
<div className="py-2 flex flex-col gap-1">
  <div className="flex justify-between items-center">
    <span className="font-mono text-xs text-txt">{asset.name}</span>
    <span className={`text-xs font-mono ${healthTextColor(asset.healthPercent)}`}>
      {asset.healthPercent}%
    </span>
  </div>
  <div className="w-full h-1.5 bg-line rounded-full">
    <div
      className={`h-full rounded-full transition-all duration-500 ${healthBgColor(asset.healthPercent)}`}
      style={{ width: `${asset.healthPercent}%` }}
    />
  </div>
  {asset.underAttack && (
    <span className="text-xs font-mono text-danger animate-pulse">[!] UNDER ATTACK</span>
  )}
</div>
```

---

### `src/components/blue-team/AlertFeed.tsx`

**Fungsi:** SOC alert queue — tampilkan dan ack alert

```
┌─────────────────────────────────────────────┐
│ ◉ SOC ALERTS  [4 OPEN]                     │
│ ─────────────────────────────────────────── │
│ 🔴 CRITICAL  PLN Grid   Under attack       │
│    00:03:14  ENERGI     [ACK]               │
│ 🟡 HIGH      BI–FAST    Traffic anomaly    │
│    00:02:55  KEUANGAN   [ACK]               │
│ 🔵 MEDIUM    Telkom NOC  IOC matched       │
│    00:01:30  TELKO      [ACK] ✓             │
└─────────────────────────────────────────────┘
```

**Detail:**
- Sort: `critical > high > medium > low`, terbaru dulu
- Color per severity: critical=danger, high=warn, medium=purple, low=muted
- ACK button: `ackAlert(alert.id)` → graykan row + checkmark
- Max 50 alerts di store, scroll di panel

---

### `src/components/blue-team/MitreHeatmap.tsx`

**Fungsi:** MITRE ATT&CK technique intensity bar chart

```
┌─────────────────────────────────────────────────────┐
│ ◉ MITRE ATT&CK HEATMAP                             │
│ ─────────────────────────────────────────────────── │
│ T1566 Phishing           ████████████░░░░  76%     │
│ T1190 Exploit Pub-Facing ██████░░░░░░░░░░  43%     │
│ T1059 Command Interp.    ████████████████  100%    │
│ T1021 Remote Services    ███░░░░░░░░░░░░░  18%     │
│ ...                                                 │
└─────────────────────────────────────────────────────┘
```

**Detail:**
- Tiap row: `flex items-center gap-2`
- TechID: `font-mono text-xs text-purple w-12 shrink-0`
- Name: `text-xs text-txt w-36 shrink-0 truncate`
- Bar: `flex-1 h-2 bg-line rounded-sm` + fill `bg-danger/80`
- Percent: `font-mono text-xs text-muted w-10 text-right`
- Tick setiap 2 detik: intensitas naik/turun ±5–15 random per technique

---

### `src/components/blue-team/DefenseControls.tsx`

**Fungsi:** Toggle 6 defense tools — sidebar atau dalam SectorPanel

```
┌──────────────────────────────────┐
│ DEFENSE CONTROLS                 │
│ ─────────────────────────────── │
│ [FW] FIREWALL    ● ON           │
│ [IDS] IDS        ○ OFF          │
│ [IPS] IPS        ○ OFF          │
│ [WAF] WAF        ● ON           │
│ [EDR] EDR        ● ON           │
│ [SIEM] SIEM      ● ON           │
└──────────────────────────────────┘
```

**Detail:**
- Toggle: `setDefense('firewall', !firewallOn)`
- ON state: `text-signal`, OFF: `text-muted`
- Tiap tool aktif mengurangi damage di `doTick()`

---

## Komponen Shared / Utility

### `src/components/layout/StatusBadge.tsx`

```tsx
interface StatusBadgeProps {
  status: AssetStatus
}

const STATUS_CONFIG: Record<AssetStatus, { label: string; className: string }> = {
  secure:      { label: 'SECURE',      className: 'bg-signal/20 text-signal border-signal/40' },
  ok:          { label: 'OK',          className: 'bg-signal/10 text-signal/70 border-signal/20' },
  warn:        { label: 'DEGRADED',    className: 'bg-warn/20 text-warn border-warn/40' },
  critical:    { label: 'CRITICAL',    className: 'bg-danger/20 text-danger border-danger/40' },
  compromised: { label: 'COMPROMISED', className: 'bg-danger/30 text-danger border-danger/60 animate-pulse' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono border ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
```

---

### `src/components/layout/HealthBar.tsx`

```tsx
interface HealthBarProps {
  value: number    // 0–100
  height?: string  // default 'h-1.5'
  showLabel?: boolean
}

export function HealthBar({ value, height = 'h-1.5', showLabel = false }: HealthBarProps) {
  const color = value > 60 ? 'bg-signal' : value > 30 ? 'bg-warn' : 'bg-danger'
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${height} bg-line rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className={`font-mono text-xs w-10 text-right ${
          value > 60 ? 'text-signal' : value > 30 ? 'text-warn' : 'text-danger'
        }`}>
          {value}%
        </span>
      )}
    </div>
  )
}
```

---

## Komponen File Map

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                     → redirect /war-room
│   ├── war-room/
│   │   └── page.tsx
│   ├── red-team/
│   │   └── page.tsx
│   └── blue-team/
│       └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── ToastContainer.tsx
│   │   ├── StatusBadge.tsx
│   │   └── HealthBar.tsx
│   │
│   ├── three/
│   │   ├── ThreatGlobe.tsx           ← 'use client', R3F canvas
│   │   └── NetworkGraph3D.tsx        ← 'use client', R3F canvas
│   │
│   ├── war-room/
│   │   ├── AttackFeed.tsx
│   │   ├── Scoreboard.tsx
│   │   └── ThreatLevelOverlay.tsx
│   │
│   ├── red-team/
│   │   ├── TargetBoard.tsx
│   │   ├── KillChainStepper.tsx
│   │   ├── C2SessionPanel.tsx
│   │   ├── PayloadPanel.tsx
│   │   └── ExfilPanel.tsx
│   │
│   └── blue-team/
│       ├── SectorDefensePanel.tsx
│       ├── AssetHealthBySektor.tsx
│       ├── AlertFeed.tsx
│       ├── MitreHeatmap.tsx
│       └── DefenseControls.tsx
│
├── store/
│   └── warStore.ts
│
├── lib/
│   ├── types.ts
│   ├── sectorData.ts
│   ├── eventPool.ts
│   ├── mitreData.ts
│   ├── killChain.ts
│   ├── payloads.ts
│   ├── threeHelpers.ts
│   └── simEngine.ts
│
└── styles/
    └── globals.css                   ← @import "tailwindcss" + @theme
```

---

*CyberWar Simulation UI — Component Spec v1.0 — 2026*
