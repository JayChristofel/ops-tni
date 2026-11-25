import type { AssetStatus, CompPhase, DefStatus, Severity, Team, ThreatLevel } from './types'

let _uid = 0
export const uid = (p = 'x') => `${p}-${(++_uid).toString(36)}-${Math.random().toString(36).slice(2, 6)}`

export const rand = (min: number, max: number) => Math.random() * (max - min) + min
export const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1))
export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]
export const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v))

export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  return [h, m, s].map(n => n.toString().padStart(2, '0')).join(':')
}

export function formatClock(ts: number): string {
  const d = new Date(ts)
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => n.toString().padStart(2, '0')).join(':')
}

export function formatMB(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`
  return `${mb.toFixed(1)} MB`
}

export function formatBytes(b: number): string {
  if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${b} B`
}

export const THREAT_LABELS: Record<ThreatLevel, string> = {
  1: 'NORMAL',
  2: 'GUARDED',
  3: 'ELEVATED',
  4: 'HIGH',
  5: 'CRITICAL',
}
export const getThreatLabel = (l: ThreatLevel) => THREAT_LABELS[l]

export function statusFromHealth(h: number): AssetStatus {
  if (h <= 5)  return 'compromised'
  if (h < 30)  return 'critical'
  if (h < 60)  return 'warn'
  if (h <= 80) return 'ok'
  return 'secure'
}

export function statusFromCompromise(c: number): AssetStatus {
  if (c >= 100) return 'compromised'
  if (c >= 70)  return 'critical'
  if (c >= 40)  return 'warn'
  if (c >= 20)  return 'ok'
  return 'secure'
}

export function compPhase(c: number): CompPhase {
  if (c >= 100) return 'OWNED'
  if (c >= 75)  return 'EXFIL'
  if (c >= 50)  return 'PIVOTING'
  if (c >= 25)  return 'FOOTHOLD'
  if (c > 0)    return 'RECON'
  return 'UNTOUCHED'
}

export function defStatus(avgHealth: number): DefStatus {
  if (avgHealth > 80) return 'SECURE'
  if (avgHealth > 60) return 'OK'
  if (avgHealth > 30) return 'WARN'
  return 'CRITICAL'
}

export const healthText = (v: number) => (v > 60 ? 'text-signal' : v > 30 ? 'text-warn' : 'text-danger')
export const healthBg   = (v: number) => (v > 60 ? 'bg-signal'   : v > 30 ? 'bg-warn'   : 'bg-danger')

export const TEAM_COLOR: Record<Team, string> = {
  RED:   'text-danger',
  BLUE:  'text-signal',
  INTEL: 'text-purple',
  SYS:   'text-muted',
  C2:    'text-danger',
  WARN:  'text-warn',
}

export const PREFIX_COLOR: Record<string, string> = {
  '[+]': 'text-signal',
  '[-]': 'text-danger',
  '[!]': 'text-warn',
  '[*]': 'text-muted',
  '[#]': 'text-purple',
  '[>]': 'text-txt',
  '[✗]': 'text-danger',
}

export const SEV_STYLE: Record<Severity, string> = {
  critical: 'bg-danger/20 text-danger border-danger/40',
  high:     'bg-warn/20 text-warn border-warn/40',
  medium:   'bg-purple/20 text-purple border-purple/40',
  low:      'bg-line text-muted border-line',
}

export const SEV_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }

const SG_PREFIXES = ['103.21.244', '118.201.17', '165.21.83', '119.73.140', '202.166.12', '42.61.92']
export const randomSgIp = () => `${pick(SG_PREFIXES)}.${randInt(2, 254)}`
export const randomHex = (len: number) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('')
