# Architecture — CyberWar Simulation UI

> Arsitektur teknis: data flow, state management, rendering pipeline, dan Three.js integration.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client Only)                        │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │  War Room   │  │  Red Team    │  │       Blue Team           │  │
│  │  /war-room  │  │  /red-team   │  │       /blue-team          │  │
│  └──────┬──────┘  └──────┬───────┘  └─────────────┬─────────────┘  │
│         │                │                        │               │
│         └────────────────┴────────────────────────┘               │
│                              │                                     │
│                   ┌──────────▼──────────┐                          │
│                   │    Zustand Store    │                          │
│                   │     warStore.ts     │                          │
│                   │  (global war state) │                          │
│                   └──────────┬──────────┘                          │
│                              │                                     │
│                   ┌──────────▼──────────┐                          │
│                   │   Sim Engine        │                          │
│                   │   simEngine.ts      │                          │
│                   │  setInterval 2000ms │                          │
│                   └─────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Tidak ada backend.** Semua state di-manage di client menggunakan Zustand v5. Data master di-hardcode di `sectorData.ts`. Simulasi berjalan via `setInterval` tick.

---

## State Management — Zustand v5

### Store Architecture

```
warStore.ts
├── Global State
│   ├── tick: number                 → incremental tick counter
│   ├── threatLevel: 1–5             → current threat level
│   ├── conflictSeconds: number      → elapsed time
│   ├── redOpsActive: number         → active red operations
│   ├── blueIncidents: number        → open blue incidents
│   ├── exfilTotal: number           → total MB exfiltrated
│   └── threatsBlocked: number       → total threats blocked
│
├── Red Team State
│   ├── sgTargets: SGTarget[]        → 6 SG targets dengan status
│   ├── selectedTargetId: string     → currently selected target
│   ├── c2Sessions: C2Session[]      → active C2 connections
│   └── activePhase: KillPhase       → current kill chain phase
│
├── Blue Team State
│   ├── idAssets: IDAsset[]          → 20 ID assets dengan health
│   ├── sectors: Sector[]            → 8 computed sectors
│   ├── alerts: Alert[]              → SOC alert queue
│   ├── mitreData: MitreEntry[]      → ATT&CK technique intensities
│   ├── iocs: IOC[]                  → threat intel IOCs
│   └── activeSectorFilter: SectorId → Blue Team sector filter
│
├── Defense Controls
│   ├── firewallOn: boolean
│   ├── idsOn: boolean
│   ├── ipsOn: boolean
│   ├── wafOn: boolean
│   ├── edrOn: boolean
│   └── siemOn: boolean
│
└── Shared
    └── attackLog: LogEntry[]        → shared log stream (max 100)
```

### Selector Pattern

Gunakan selector per field untuk menghindari unnecessary re-renders:

```ts
// ✅ BENAR — hanya subscribe ke field yang dibutuhkan
const tick = useWarStore(s => s.tick)
const alerts = useWarStore(s => s.alerts)

// ❌ SALAH — subscribe ke seluruh state = re-render setiap perubahan apapun
const { tick, alerts, ...rest } = useWarStore()
```

---

## Data Flow

### Simulation Tick (2 detik)

```
setInterval(2000ms)
       │
       ▼
  doTick() [warStore]
       │
  ┌────┴─────────────────────────────────┐
  │                                      │
  ▼                                      ▼
RED_EVENTS (1–3 random)          BLUE_EVENTS (1–2 random)
  │                                      │
  ▼                                      ▼
Update sgTargets                   Push ke alerts[]
  │  compromisePercent++               │  Push ke attackLog[]
  │  c2Sessions++                      │
  ▼                                      ▼
Inject attackLog entries          Update idAssets.healthPercent
  │  (RED/INTEL prefix)             │  (turun kalau underAttack && !defense)
  │                                 │
  ▼                                 ▼
Update mitreData.intensity        Computed update sectors[]
  │  (random ±1 per technique)      │  (avg health per sectorId)
  │                                 │
  └──────────────┬──────────────────┘
                 │
                 ▼
           Recalculate threatLevel
           dari avg semua idAssets.healthPercent
                 │
                 ▼
           Trim attackLog ke 100 entries
```

### User Action Flow

```
User Click (mis. [DEPLOY SECTOR DEFENSE])
       │
       ▼
  deploySectorDef('energy') [warStore action]
       │
  ┌────┴────────────────────┐
  │                         │
  ▼                         ▼
Update semua idAssets    Set sector.defenseDeployedAt
yang sectorId='energy'   untuk cooldown countdown 30s
  │  healthPercent += 10   │
  │                        ▼
  ▼                   addLog({
Update sectors         team:'BLUE',
computed avg           msg:'Sector ENERGI defense deployed'
                       })
  │
  ▼
addToast("Sector ENERGI defense activated")
```

---

## Three.js Architecture

### Next.js 15 + R3F SSR Problem

```
❌ Error di Next.js 15:
TypeError: Cannot read properties of undefined (reading 'ReactCurrentOwner')

Penyebab: Three.js menggunakan browser-specific APIs yang tidak ada di Node.js SSR

✅ Solusi: Dynamic import dengan ssr: false
```

```tsx
// war-room/page.tsx
const ThreatGlobe = dynamic(
  () => import('@/components/three/ThreatGlobe'),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-surface rounded-card" />
  }
)

// blue-team/page.tsx
const NetworkGraph = dynamic(
  () => import('@/components/three/NetworkGraph3D'),
  { ssr: false }
)
```

### ThreatGlobe — War Room

```
<Canvas camera={{ position:[0,1.5,4], fov:45 }} gl={{ antialias:true }}>
  <ambientLight intensity={0.15} />
  <pointLight position={[5,5,5]} intensity={0.3} />
  
  <GlobeMesh />
  ├── SphereGeometry args={[2, 64, 64]}
  ├── MeshStandardMaterial wireframe={false}
  │   color="#0B2A1F" (dark green tint)
  └── wireframe overlay terpisah dengan opacity rendah
  
  <AttackArcs direction="outgoing" color="#FF6B6B" />
  ├── Baca sgTargets dari store
  ├── geoToVec3(lat, lng) untuk titik asal (Jakarta coords cluster)
  ├── geoToVec3(target.geoCoord.lat, target.geoCoord.lng) untuk tujuan
  ├── QuadraticBezierCurve3(start, mid, end) — mid diangkat keluar sphere
  ├── TubeGeometry dari curve
  └── useFrame → animasi dashOffset (gerakan mengalir)
  
  <AttackArcs direction="incoming" color="#3DDC97" />
  └── Sama tapi balik arah (SG → Jakarta)
  
  <GlobeNodes />
  ├── Per SGTarget: SphereGeometry kecil di posisi Vec3
  ├── underAttack → RingGeometry berputar (useFrame rotate)
  └── Html label dari drei (nama + compromise%)
  
  <ParticleFlow />
  └── Points geometry, random particles di orbit globe
  
  <OrbitControls
    enableZoom={false} enablePan={false}
    autoRotate autoRotateSpeed={0.3}
    minPolarAngle={Math.PI/4} maxPolarAngle={Math.PI/1.8}
  />
</Canvas>
```

### NetworkGraph3D — Blue Team

```
<Canvas camera={{ position:[0, 5, 0], fov:60 }} gl={{ antialias:true }}>
  <ambientLight intensity={0.2} />
  
  {/* 8 Cluster Sectors */}
  {SECTORS.map(sector => (
    <SectorCluster
      key={sector.id}
      sector={sector}
      position={CLUSTER_POSITIONS[sector.id]}
    />
  ))}
  ├── SectorCluster
  │   ├── Html label (icon + nama)
  │   ├── Cluster center marker (kecil)
  │   └── {assets.map(asset => <AssetNode ... />)}
  │       ├── AssetNode
  │       │   ├── SphereGeometry r=0.08
  │       │   ├── Color: secure→signal, ok→signal dim, warn→warn, critical→danger
  │       │   ├── underAttack → TorusGeometry ring berputar
  │       │   └── Html tooltip on hover
  │       └── ThreatEdge (kalau underAttack)
  │           └── Line dari arah SG (x:5, z:0) ke node position
  
  <OrbitControls
    enableZoom autoRotate={false}
    enablePan
  />
</Canvas>
```

**Cluster Positions (XZ plane, Y=0):**

```
                 energy (0, -2.5)
           telco ↖              ↗ transport
      (-1.77,-1.77)              (1.77,-1.77)
                                  
  health ←  (-2.5, 0)    (2.5, 0)  → cctv
                                  
      (-1.77, 1.77)              (1.77, 1.77)
        military ↙              ↘ finance
                 government (0, 2.5)
```

---

## Routing & Page Architecture

```
Next.js 15 App Router
├── / → redirect /war-room
├── /war-room    → War Room page (SimEngine start)
├── /red-team    → Red Team page
└── /blue-team   → Blue Team page

SimEngine hanya start SEKALI di war-room/page.tsx
State shared via Zustand (tidak perlu restart di halaman lain)
```

---

## Performance Considerations

### Three.js Optimization

```ts
// Gunakan instancing untuk banyak nodes serupa
const instancedMesh = useRef<THREE.InstancedMesh>(null)
// Set posisi per instance, bukan render N komponen terpisah

// Dispose geometry & material saat unmount
useEffect(() => {
  return () => {
    geometry.dispose()
    material.dispose()
  }
}, [])
```

### React Optimization

```ts
// Zustand selective subscription
const selectedId = useWarStore(s => s.selectedTargetId)   // ✅
const { selectedTargetId } = useWarStore()                 // ❌

// Memoize komponen yang tidak butuh re-render sering
const TargetCard = memo(({ target }: { target: SGTarget }) => { ... })

// Callback stability
const handleSelect = useCallback((id: string) => selectTarget(id), [selectTarget])
```

### Log Management

```ts
// Di dalam doTick():
set(state => ({
  attackLog: [...state.attackLog, newEntry].slice(-100)  // max 100 entries
}))
```

---

## Error Boundaries

```tsx
// Wrapping R3F canvas (R3F punya built-in error boundary)
<Canvas onCreated={({ gl }) => { gl.setPixelRatio(window.devicePixelRatio) }}>
  {/* Scene content */}
</Canvas>

// Fallback untuk dynamic import loading state
const ThreatGlobe = dynamic(() => import('@/components/three/ThreatGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface rounded-card">
      <span className="text-muted text-sm font-mono animate-pulse">
        [*] INITIALIZING THREAT MAP...
      </span>
    </div>
  )
})
```

---

## Directory Conventions

| Folder | Isi |
|--------|-----|
| `src/app/` | Next.js App Router pages + layout |
| `src/components/three/` | Semua R3F Three.js components (`'use client'`) |
| `src/components/war-room/` | UI komponen eksklusif War Room |
| `src/components/red-team/` | UI komponen eksklusif Red Team |
| `src/components/blue-team/` | UI komponen eksklusif Blue Team |
| `src/components/layout/` | Global layout components (Navbar, Toast) |
| `src/store/` | Zustand stores |
| `src/lib/` | Utilities, types, constants, master data |
| `src/styles/` | Global CSS (Tailwind v4 `@theme`) |

---

*CyberWar Simulation UI — Architecture v1.0 — 2026*
