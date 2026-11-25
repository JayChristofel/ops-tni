# Data Schema — CyberWar Simulation UI

> TypeScript types lengkap + master data: 6 SG targets, 8 sectors, 20 ID assets.

---

## TypeScript Types

### `src/lib/types.ts`

```ts
// ============================================================
// ENUMS
// ============================================================

export type SectorId =
  | 'energy'
  | 'transport'
  | 'cctv'
  | 'finance'
  | 'government'
  | 'military'
  | 'health'
  | 'telco'

export type KillPhase =
  | 'recon'
  | 'weaponize'
  | 'deliver'
  | 'exploit'
  | 'install'
  | 'c2'
  | 'exfil'

export type ThreatLevel = 1 | 2 | 3 | 4 | 5

export type AssetStatus =
  | 'secure'      // health > 80, tidak diserang
  | 'ok'          // health 60–80
  | 'warn'        // health 30–60
  | 'critical'    // health < 30
  | 'compromised' // fully breached

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export type LogTeam = 'RED' | 'BLUE' | 'INTEL' | 'SYS' | 'C2'

export type DefenseType =
  | 'firewall'
  | 'ids'
  | 'ips'
  | 'waf'
  | 'edr'
  | 'siem'

// ============================================================
// GEO
// ============================================================

export interface GeoCoord {
  lat: number
  lng: number
}

// ============================================================
// WAR STATE — Shared/Global
// ============================================================

export interface LogEntry {
  id:       string
  ts:       number      // Date.now()
  team:     LogTeam
  msg:      string
  severity: AlertSeverity
}

export interface ToastEntry {
  id:      string
  msg:     string
  variant: 'info' | 'warn' | 'danger' | 'success'
}

// ============================================================
// RED TEAM
// ============================================================

export interface SGTarget {
  id:               string    // 'sg-01' ... 'sg-06'
  name:             string    // "MAS – Changi ATC"
  sector:           string    // "transport"
  geoCoord:         GeoCoord
  compromisePercent: number   // 0–100
  underAttack:      boolean
  c2Sessions:       number    // aktif C2 connections
  dataExfil:        number    // MB exfiltrated
  status:           AssetStatus
}

export interface C2Session {
  id:         string
  targetId:   string
  targetName: string
  protocol:   'http' | 'dns' | 'tcp' | 'icmp'
  startedAt:  number    // timestamp
  dataBytes:  number
  active:     boolean
}

export interface KillChainStep {
  phase:       KillPhase
  label:       string    // "RECONNAISSANCE"
  description: string
  completed:   boolean
  active:      boolean
}

export interface PayloadTemplate {
  id:      string
  name:    string
  type:    'ransomware' | 'backdoor' | 'keylogger' | 'wiper' | 'exfil_agent'
  size:    string    // "2.3 KB"
  rating:  number    // 1–5 effectiveness
}

// ============================================================
// BLUE TEAM
// ============================================================

export interface IDAsset {
  id:              string      // 'id-01' ... 'id-20'
  name:            string      // "PLN – Pusat Kontrol Grid Jawa"
  sectorId:        SectorId
  geoCoord:        GeoCoord    // posisi di globe
  healthPercent:   number      // 0–100
  underAttack:     boolean
  status:          AssetStatus
  defenseActive:   boolean     // ada deployed defense?
  lastIncident:    number | null  // timestamp
}

export interface Sector {
  id:              SectorId
  label:           string        // "ENERGI"
  icon:            string        // emoji atau nama icon
  assets:          IDAsset[]     // computed dari idAssets
  avgHealth:       number        // rata-rata health semua asset
  assetsUnderAttack: number      // count
  clusterPos:      { x: number; y: number; z: number }
  defenseDeployedAt: number | null  // timestamp, null jika tidak ada cooldown
}

export interface Alert {
  id:         string
  ts:         number
  sectorId:   SectorId
  assetId:    string
  assetName:  string
  severity:   AlertSeverity
  msg:        string
  ack:        boolean
}

export interface MitreEntry {
  techniqueId:  string    // "T1566"
  name:         string    // "Phishing"
  tactic:       string    // "Initial Access"
  intensity:    number    // 0–100
}

export interface IOC {
  id:       string
  type:     'ip' | 'domain' | 'hash' | 'url'
  value:    string
  threat:   string
  ts:       number
}

// ============================================================
// STORE STATE
// ============================================================

export interface WarState {
  // Global
  tick:              number
  threatLevel:       ThreatLevel
  conflictSeconds:   number
  redOpsActive:      number
  blueIncidents:     number
  exfilTotal:        number
  threatsBlocked:    number
  attackLog:         LogEntry[]
  toasts:            ToastEntry[]

  // Red Team
  sgTargets:         SGTarget[]
  selectedTargetId:  string | null
  c2Sessions:        C2Session[]
  activePhase:       KillPhase

  // Blue Team
  idAssets:          IDAsset[]
  sectors:           Sector[]
  alerts:            Alert[]
  mitreData:         MitreEntry[]
  iocs:              IOC[]
  activeSectorFilter: SectorId | null

  // Defense Controls
  firewallOn:  boolean
  idsOn:       boolean
  ipsOn:       boolean
  wafOn:       boolean
  edrOn:       boolean
  siemOn:      boolean
}

export interface WarActions {
  // Sim Engine
  doTick:           () => void
  startSim:         () => void

  // Red Team
  selectTarget:     (id: string) => void
  launchAttack:     (targetId: string) => void
  setPhase:         (phase: KillPhase) => void

  // Blue Team
  deploySectorDef:  (sectorId: SectorId) => void
  ackAlert:         (alertId: string) => void
  setDefense:       (key: DefenseType, val: boolean) => void
  setSectorFilter:  (id: SectorId | null) => void

  // Shared
  addLog:           (entry: Omit<LogEntry, 'id' | 'ts'>) => void
  addToast:         (entry: Omit<ToastEntry, 'id'>) => void
  dismissToast:     (id: string) => void
}

export type WarStore = WarState & WarActions
```

---

## Master Data

### `src/lib/sectorData.ts`

#### 6 Singapore Targets

```ts
export const SG_TARGETS_MASTER: Omit<SGTarget, 'compromisePercent' | 'underAttack' | 'c2Sessions' | 'dataExfil' | 'status'>[] = [
  {
    id:       'sg-01',
    name:     'CAAS – Changi ATC',
    sector:   'transport',
    geoCoord: { lat: 1.3644, lng: 103.9915 },
  },
  {
    id:       'sg-02',
    name:     'MAS – Pusat Kliring FAST',
    sector:   'finance',
    geoCoord: { lat: 1.2837, lng: 103.8607 },
  },
  {
    id:       'sg-03',
    name:     'EMA – Smart Grid Control',
    sector:   'energy',
    geoCoord: { lat: 1.3521, lng: 103.8198 },
  },
  {
    id:       'sg-04',
    name:     'MINDEF – C2 Node Barat',
    sector:   'military',
    geoCoord: { lat: 1.3416, lng: 103.7033 },
  },
  {
    id:       'sg-05',
    name:     'GovTech – Pusat Data Nasional',
    sector:   'government',
    geoCoord: { lat: 1.3214, lng: 103.8558 },
  },
  {
    id:       'sg-06',
    name:     'Singtel – NOC Utama',
    sector:   'telco',
    geoCoord: { lat: 1.2905, lng: 103.7916 },
  },
]
```

#### 8 Defense Sectors + Cluster Positions

```ts
export const SECTOR_META: Record<SectorId, {
  label: string
  icon:  string
  clusterPos: { x: number; y: number; z: number }
}> = {
  energy:     { label: 'ENERGI',      icon: '⚡', clusterPos: { x: 0,     y: 0, z: -2.5  } },
  transport:  { label: 'TRANSPORTASI', icon: '🚢', clusterPos: { x: 1.77,  y: 0, z: -1.77 } },
  cctv:       { label: 'CCTV',        icon: '📷', clusterPos: { x: 2.5,   y: 0, z:  0    } },
  finance:    { label: 'KEUANGAN',    icon: '🏦', clusterPos: { x: 1.77,  y: 0, z:  1.77 } },
  government: { label: 'PEMERINTAH',  icon: '🏛️', clusterPos: { x: 0,     y: 0, z:  2.5  } },
  military:   { label: 'MILITER',     icon: '🛡️', clusterPos: { x: -1.77, y: 0, z:  1.77 } },
  health:     { label: 'KESEHATAN',   icon: '🏥', clusterPos: { x: -2.5,  y: 0, z:  0    } },
  telco:      { label: 'TELKO',       icon: '📡', clusterPos: { x: -1.77, y: 0, z: -1.77 } },
}
```

#### 20 Indonesia Assets

```ts
export const ID_ASSETS_MASTER: Omit<IDAsset, 'healthPercent' | 'underAttack' | 'status' | 'defenseActive' | 'lastIncident'>[] = [
  // ⚡ ENERGY (3 assets)
  {
    id:       'id-01',
    name:     'PLN – Grid Kontrol Jawa',
    sectorId: 'energy',
    geoCoord: { lat: -6.2, lng: 106.8 },
  },
  {
    id:       'id-02',
    name:     'Pertamina – SCADA Pipeline Sumatra',
    sectorId: 'energy',
    geoCoord: { lat: -1.0, lng: 101.5 },
  },
  {
    id:       'id-03',
    name:     'PLN – Pusat Distribusi Sulawesi',
    sectorId: 'energy',
    geoCoord: { lat: -1.5, lng: 124.9 },
  },

  // 🚢 TRANSPORTASI (3 assets)
  {
    id:       'id-04',
    name:     'Kemenhub – ATC Soekarno-Hatta',
    sectorId: 'transport',
    geoCoord: { lat: -6.127, lng: 106.656 },
  },
  {
    id:       'id-05',
    name:     'Pelindo – Sistem Pelabuhan Tanjung Priok',
    sectorId: 'transport',
    geoCoord: { lat: -6.1, lng: 106.88 },
  },
  {
    id:       'id-06',
    name:     'KAI – Pusat Kendali Kereta Nasional',
    sectorId: 'transport',
    geoCoord: { lat: -6.9, lng: 107.6 },
  },

  // 📷 CCTV (2 assets)
  {
    id:       'id-07',
    name:     'Polri – Pusat Pemantauan CCTV Jakarta',
    sectorId: 'cctv',
    geoCoord: { lat: -6.21, lng: 106.845 },
  },
  {
    id:       'id-08',
    name:     'Dishub DKI – Command Center ATCS',
    sectorId: 'cctv',
    geoCoord: { lat: -6.185, lng: 106.835 },
  },

  // 🏦 KEUANGAN (3 assets)
  {
    id:       'id-09',
    name:     'BI – Sistem BI-FAST',
    sectorId: 'finance',
    geoCoord: { lat: -6.185, lng: 106.812 },
  },
  {
    id:       'id-10',
    name:     'BRI – Core Banking System',
    sectorId: 'finance',
    geoCoord: { lat: -6.21, lng: 106.831 },
  },
  {
    id:       'id-11',
    name:     'OJK – Pusat Pengawasan Pasar Modal',
    sectorId: 'finance',
    geoCoord: { lat: -6.225, lng: 106.825 },
  },

  // 🏛️ PEMERINTAH (2 assets)
  {
    id:       'id-12',
    name:     'BSSN – Pusat Operasi Siber Nasional',
    sectorId: 'government',
    geoCoord: { lat: -6.235, lng: 106.845 },
  },
  {
    id:       'id-13',
    name:     'Kominfo – NOC PDN',
    sectorId: 'government',
    geoCoord: { lat: -6.19, lng: 106.82 },
  },

  // 🛡️ MILITER (2 assets)
  {
    id:       'id-14',
    name:     'Mabes TNI – Sistem C2 Terpadu',
    sectorId: 'military',
    geoCoord: { lat: -6.26, lng: 106.78 },
  },
  {
    id:       'id-15',
    name:     'Kogabwilhan I – Node Siber Barat',
    sectorId: 'military',
    geoCoord: { lat: -6.23, lng: 106.75 },
  },

  // 🏥 KESEHATAN (2 assets)
  {
    id:       'id-16',
    name:     'Kemenkes – Sistem Informasi Kesehatan Nasional',
    sectorId: 'health',
    geoCoord: { lat: -6.185, lng: 106.853 },
  },
  {
    id:       'id-17',
    name:     'BPJS – Database Kepesertaan',
    sectorId: 'health',
    geoCoord: { lat: -6.21, lng: 106.861 },
  },

  // 📡 TELKO (3 assets)
  {
    id:       'id-18',
    name:     'Telkom – NOC Palapa Ring',
    sectorId: 'telco',
    geoCoord: { lat: -6.175, lng: 106.783 },
  },
  {
    id:       'id-19',
    name:     'Indosat – Pusat Kendali Jaringan',
    sectorId: 'telco',
    geoCoord: { lat: -6.198, lng: 106.795 },
  },
  {
    id:       'id-20',
    name:     'XL Axiata – Core Network Jakarta',
    sectorId: 'telco',
    geoCoord: { lat: -6.213, lng: 106.818 },
  },
]
```

---

## Event Pool

### `src/lib/eventPool.ts`

```ts
// Template event untuk simulasi — dipakai di doTick()

export interface SimEvent {
  team:     LogTeam
  severity: AlertSeverity
  msgFn:    (targetName: string) => string
}

export const RED_EVENT_POOL: SimEvent[] = [
  { team: 'RED',   severity: 'high',     msgFn: n => `Memulai scan port pada ${n} [SYN FLOOD]` },
  { team: 'RED',   severity: 'critical', msgFn: n => `Eksploitasi CVE-2024-3094 pada ${n}` },
  { team: 'RED',   severity: 'high',     msgFn: n => `Injeksi payload ke ${n} berhasil` },
  { team: 'C2',    severity: 'critical', msgFn: n => `Sesi C2 baru terbuka: ${n} ← beacon aktif` },
  { team: 'RED',   severity: 'high',     msgFn: n => `Lateral movement terdeteksi di ${n}` },
  { team: 'RED',   severity: 'critical', msgFn: n => `Eksfiltrasi data dimulai dari ${n}` },
  { team: 'INTEL', severity: 'medium',   msgFn: n => `Rekon pasif pada ${n} selesai — 23 endpoint teridentifikasi` },
  { team: 'RED',   severity: 'high',     msgFn: n => `Credential dump berhasil pada ${n}` },
  { team: 'C2',    severity: 'critical', msgFn: n => `Persistence established di ${n} — registry key dibuat` },
  { team: 'RED',   severity: 'medium',   msgFn: n => `Fuzzing API endpoint ${n} — 7 anomali ditemukan` },
]

export const BLUE_EVENT_POOL: SimEvent[] = [
  { team: 'BLUE', severity: 'medium',   msgFn: n => `Anomali traffic terdeteksi di ${n}` },
  { team: 'BLUE', severity: 'high',     msgFn: n => `Signature serangan dicocokkan — ${n} dalam pengamatan` },
  { team: 'BLUE', severity: 'critical', msgFn: n => `Alert kritis: ${n} menunjukkan indikasi kompromi` },
  { team: 'BLUE', severity: 'medium',   msgFn: n => `Blok IP otomatis diaktifkan pada ${n}` },
  { team: 'BLUE', severity: 'low',      msgFn: n => `Scan internal selesai — ${n} bersih` },
  { team: 'BLUE', severity: 'high',     msgFn: n => `Isolasi jaringan dipicu untuk ${n}` },
  { team: 'SYS',  severity: 'low',      msgFn: n => `Defense update diterima oleh ${n}` },
  { team: 'BLUE', severity: 'medium',   msgFn: n => `IOC baru ditemukan dalam traffic menuju ${n}` },
]
```

---

## MITRE ATT&CK — Initial Dataset

### `src/lib/mitreData.ts`

```ts
export const MITRE_INITIAL: MitreEntry[] = [
  // Initial Access
  { techniqueId: 'T1566', name: 'Phishing',              tactic: 'Initial Access',  intensity: 0 },
  { techniqueId: 'T1190', name: 'Exploit Public-Facing', tactic: 'Initial Access',  intensity: 0 },
  { techniqueId: 'T1133', name: 'External Remote Svcs',  tactic: 'Initial Access',  intensity: 0 },
  
  // Execution
  { techniqueId: 'T1059', name: 'Command Interpreter',   tactic: 'Execution',       intensity: 0 },
  { techniqueId: 'T1203', name: 'Exploitation for Code', tactic: 'Execution',       intensity: 0 },
  
  // Persistence
  { techniqueId: 'T1547', name: 'Boot Autostart',        tactic: 'Persistence',     intensity: 0 },
  { techniqueId: 'T1136', name: 'Create Account',        tactic: 'Persistence',     intensity: 0 },
  
  // Lateral Movement
  { techniqueId: 'T1021', name: 'Remote Services',       tactic: 'Lateral Movement', intensity: 0 },
  { techniqueId: 'T1550', name: 'Use Alt Auth Material', tactic: 'Lateral Movement', intensity: 0 },
  
  // Command & Control
  { techniqueId: 'T1071', name: 'App Layer Protocol',    tactic: 'Command & Control', intensity: 0 },
  { techniqueId: 'T1572', name: 'Protocol Tunneling',    tactic: 'Command & Control', intensity: 0 },
  { techniqueId: 'T1095', name: 'Non-App Layer Proto',   tactic: 'Command & Control', intensity: 0 },
  
  // Exfiltration
  { techniqueId: 'T1041', name: 'Exfil Over C2',         tactic: 'Exfiltration',    intensity: 0 },
  { techniqueId: 'T1567', name: 'Exfil Over Web Svc',    tactic: 'Exfiltration',    intensity: 0 },
  
  // Impact
  { techniqueId: 'T1485', name: 'Data Destruction',      tactic: 'Impact',          intensity: 0 },
  { techniqueId: 'T1489', name: 'Service Stop',          tactic: 'Impact',          intensity: 0 },
]
```

---

## Kill Chain Steps

### `src/lib/killChain.ts`

```ts
export const KILL_CHAIN_STEPS: Omit<KillChainStep, 'completed' | 'active'>[] = [
  {
    phase:       'recon',
    label:       'RECONNAISSANCE',
    description: 'Passive OSINT + active network scanning'
  },
  {
    phase:       'weaponize',
    label:       'WEAPONIZATION',
    description: 'Exploit development + payload crafting'
  },
  {
    phase:       'deliver',
    label:       'DELIVERY',
    description: 'Phishing, watering hole, supply chain'
  },
  {
    phase:       'exploit',
    label:       'EXPLOITATION',
    description: 'Trigger vulnerability, gain initial access'
  },
  {
    phase:       'install',
    label:       'INSTALLATION',
    description: 'Implant persistence, backdoor deployment'
  },
  {
    phase:       'c2',
    label:       'COMMAND & CONTROL',
    description: 'Establish C2 channel, maintain access'
  },
  {
    phase:       'exfil',
    label:       'EXFILTRATION',
    description: 'Data collection + exfil over covert channel'
  },
]
```

---

## Payload Templates

### `src/lib/payloads.ts`

```ts
export const PAYLOAD_TEMPLATES: PayloadTemplate[] = [
  {
    id:     'pl-01',
    name:   'SingSlayer.exe',
    type:   'ransomware',
    size:   '45 KB',
    rating: 5,
  },
  {
    id:     'pl-02',
    name:   'BackdoorNG.sh',
    type:   'backdoor',
    size:   '12 KB',
    rating: 4,
  },
  {
    id:     'pl-03',
    name:   'KeyTrace.dll',
    type:   'keylogger',
    size:   '8 KB',
    rating: 3,
  },
  {
    id:     'pl-04',
    name:   'WipeAll.bin',
    type:   'wiper',
    size:   '3 KB',
    rating: 5,
  },
  {
    id:     'pl-05',
    name:   'DataVampire.py',
    type:   'exfil_agent',
    size:   '22 KB',
    rating: 4,
  },
]
```

---

## Helper Functions

### `src/lib/threeHelpers.ts`

```ts
import * as THREE from 'three'

/**
 * Konversi koordinat geografis ke posisi Three.js di permukaan sphere.
 * @param lat Latitude dalam derajat
 * @param lng Longitude dalam derajat
 * @param radius Radius sphere (default: 2 unit)
 */
export function geoToVec3(lat: number, lng: number, radius = 2): THREE.Vector3 {
  const phi   = (90 - lat)  * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  )
}

/**
 * Hitung midpoint arc di luar sphere untuk QuadraticBezierCurve3.
 * Digunakan sebagai titik tengah attack arc agar melengkung keluar.
 */
export function arcMidpoint(
  start: THREE.Vector3,
  end:   THREE.Vector3,
  lift = 1.5
): THREE.Vector3 {
  const mid = new THREE.Vector3()
    .addVectors(start, end)
    .multiplyScalar(0.5)
  return mid.normalize().multiplyScalar(mid.length() * lift)
}

/**
 * Interpolasi warna health (100% hijau → 0% merah)
 */
export function healthColor(pct: number): string {
  if (pct > 60) return '#3DDC97'   // signal
  if (pct > 30) return '#F2B84B'   // warn
  return '#FF6B6B'                  // danger
}

/**
 * Generate Jakarta attack origin cluster
 * (5 titik tersebar sekitar Jakarta untuk variansi arc)
 */
export const JAKARTA_ATTACK_ORIGINS: THREE.Vector3[] = [
  geoToVec3(-6.2,  106.8),
  geoToVec3(-6.3,  106.9),
  geoToVec3(-6.1,  106.75),
  geoToVec3(-6.25, 106.85),
  geoToVec3(-6.15, 106.70),
]
```

---

## Store Initialization

### Initial State Values

```ts
export const INITIAL_STATE: Partial<WarState> = {
  tick:              0,
  threatLevel:       1,
  conflictSeconds:   0,
  redOpsActive:      0,
  blueIncidents:     0,
  exfilTotal:        0,
  threatsBlocked:    0,
  attackLog:         [],
  toasts:            [],
  
  sgTargets:         SG_TARGETS_MASTER.map(t => ({
    ...t,
    compromisePercent: 0,
    underAttack:       false,
    c2Sessions:        0,
    dataExfil:         0,
    status:            'secure' as AssetStatus,
  })),
  selectedTargetId:  null,
  c2Sessions:        [],
  activePhase:       'recon',

  idAssets:          ID_ASSETS_MASTER.map(a => ({
    ...a,
    healthPercent:  100,
    underAttack:    false,
    status:         'secure' as AssetStatus,
    defenseActive:  false,
    lastIncident:   null,
  })),
  sectors:           [],       // computed dari idAssets
  alerts:            [],
  mitreData:         MITRE_INITIAL.map(m => ({ ...m, intensity: 0 })),
  iocs:              [],
  activeSectorFilter: null,

  firewallOn: false,
  idsOn:      false,
  ipsOn:      false,
  wafOn:      false,
  edrOn:      false,
  siemOn:     false,
}
```

---

*CyberWar Simulation UI — Data Schema v1.0 — 2026*
