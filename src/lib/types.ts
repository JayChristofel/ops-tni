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

/** Compromise phase shown on Red Team target cards (derived from compromise %). */
export type CompPhase = 'UNTOUCHED' | 'RECON' | 'FOOTHOLD' | 'PIVOTING' | 'EXFIL' | 'OWNED'

export type ThreatLevel = 1 | 2 | 3 | 4 | 5

export type AssetStatus =
  | 'secure'      // health > 80
  | 'ok'          // health 60–80
  | 'warn'        // health 30–60
  | 'critical'    // health < 30
  | 'compromised' // fully breached

export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type AlertSeverity = Severity

/** Terminal-style status prefix. */
export type LogPrefix = '[*]' | '[+]' | '[-]' | '[!]' | '[#]' | '[>]' | '[✗]'

export type Team = 'RED' | 'BLUE' | 'INTEL' | 'SYS' | 'C2' | 'WARN'
export type LogTeam = Team

export type DefenseType =
  | 'firewall'
  | 'ids'
  | 'ips'
  | 'waf'
  | 'edr'
  | 'siem'
  | 'ti'
  | 'soar'

/** Sector defense status on Blue Team. */
export type DefStatus = 'SECURE' | 'OK' | 'WARN' | 'CRITICAL'

export type PayloadStatus = 'LOADED' | 'DEPLOYED' | 'AVAILABLE' | 'DETECTED'

export type AlertAction =
  | 'ISOLATE HOST'
  | 'ESCALATE'
  | 'INVESTIGATE'
  | 'BLOCK IP'
  | 'FALSE POS'
  | 'MARK READ'

export type C2Action = 'shell' | 'pivot' | 'kill'

export type IOCAction = 'ADD BLOCKLIST' | 'SINKHOLE' | 'ADD TO EDR' | 'REPORT'

// ============================================================
// GEO
// ============================================================

export interface GeoCoord {
  lat: number
  lng: number
}

// ============================================================
// SHARED
// ============================================================

export interface LogEntry {
  id:           string
  ts:           number
  team:         Team
  prefix:       LogPrefix
  msg:          string
  severity:     Severity
  techniqueId?: string
}

export interface TerminalLine {
  id:     string
  ts:     number
  prefix: LogPrefix | ''
  text:   string
}

export interface ToastEntry {
  id:      string
  team:    'RED' | 'BLUE' | 'INTEL' | 'WARN' | 'SYS'
  msg:     string
  variant: 'info' | 'warn' | 'danger' | 'success'
}

// ============================================================
// RED TEAM
// ============================================================

export interface SGTarget {
  id:                string
  name:              string
  sector:            SectorId
  geoCoord:          GeoCoord
  compromisePercent: number
  underAttack:       boolean
  c2Sessions:        number
  dataExfil:         number   // MB
  status:            AssetStatus
  killPhase:         KillPhase // per-target independent kill chain tracking
}

export interface C2Session {
  id:          string
  targetId:    string
  targetName:  string
  hostname:    string
  ip:          string
  protocol:    'http' | 'dns' | 'tcp' | 'icmp'
  interval:    number   // beacon interval (s)
  startedAt:   number
  lastBeacon:  number
  dataBytes:   number
  active:      boolean
}

export interface KillChainStep {
  phase:       KillPhase
  short:       string   // "RECON"
  label:       string   // "RECONNAISSANCE"
  description: string
}

export interface PayloadTemplate {
  id:     string
  name:   string
  type:   string
  size:   string
  rating: number   // 1–5
}

export interface PayloadState extends PayloadTemplate {
  status: PayloadStatus
}

export interface ExfilDataset {
  id:            string
  targetId:      string
  name:          string
  sizeMB:        number
  transferredMB: number
  status:        'done' | 'in-progress' | 'pending'
}

// ============================================================
// BLUE TEAM
// ============================================================

export interface IDAsset {
  id:             string
  name:           string
  sectorId:       SectorId
  geoCoord:       GeoCoord
  healthPercent:  number
  underAttack:    boolean
  status:         AssetStatus
  defenseActive:  boolean
  lastIncident:   number | null
}

export interface Sector {
  id:                SectorId
  label:             string
  icon:              string
  assets:            IDAsset[]
  avgHealth:         number
  assetsUnderAttack: number
  openIncidents:     number
  status:            DefStatus
  clusterPos:        { x: number; y: number; z: number }
  defenseDeployedAt: number | null
}

export interface Alert {
  id:        string
  num:       number   // display number (#0031)
  ts:        number
  sectorId:  SectorId
  assetId:   string
  assetName: string
  severity:  Severity
  msg:       string
  rule:      string
  srcIp:     string
  ack:       boolean
  action:    AlertAction | null
}

export interface MitreEntry {
  techniqueId: string
  name:        string
  tactic:      string
  intensity:   number   // 0–10
}

export interface IOC {
  id:         string
  type:       'ip' | 'domain' | 'hash' | 'url'
  value:      string
  threat:     string   // actor / campaign
  confidence: number   // 0–100
  ts:         number
  actions:    IOCAction[]
}
