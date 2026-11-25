import type { DefenseType, LogPrefix, Severity, Team } from './types'

// Template event untuk simulasi — dipakai di doTick().
// Placeholder: {target} {port} {cve} {interval} {size} {next} {asset} {n}

export interface RedEvent {
  prefix: LogPrefix
  team:   Team
  msg:    string
  tech:   string
  /** efek pada state target */
  effect?: 'session' | 'beacon' | 'exfil' | 'pivot' | 'detected'
  /** kenaikan compromise % */
  gain:   number
}

export const RED_EVENTS: readonly RedEvent[] = [
  { prefix: '[*]', team: 'RED',   msg: 'Running nmap -sS on {target}',           tech: 'T1595', gain: 1 },
  { prefix: '[+]', team: 'RED',   msg: 'Port {port} open → {target}',            tech: 'T1046', gain: 1 },
  { prefix: '[!]', team: 'RED',   msg: '{cve} applicable on {target}',           tech: 'T1190', gain: 2 },
  { prefix: '[+]', team: 'RED',   msg: 'Session opened → {target}',              tech: 'T1078', gain: 3, effect: 'session' },
  { prefix: '[+]', team: 'RED',   msg: 'PrivEsc successful — root on {target}',  tech: 'T1068', gain: 4 },
  { prefix: '[*]', team: 'RED',   msg: 'Deploying persistence on {target}',      tech: 'T1053', gain: 2 },
  { prefix: '[+]', team: 'C2',    msg: 'Beacon live → C2 · {interval}s',         tech: 'T1071', gain: 1, effect: 'beacon' },
  { prefix: '[+]', team: 'RED',   msg: 'Exfil {size}MB staged → dropzone',       tech: 'T1041', gain: 2, effect: 'exfil' },
  { prefix: '[#]', team: 'INTEL', msg: 'Pivot path: {target} → {next}',          tech: 'T1021', gain: 2, effect: 'pivot' },
  { prefix: '[-]', team: 'RED',   msg: 'Payload detected on {target} — evading', tech: 'T1562', gain: 0, effect: 'detected' },
]

export interface BlueEvent {
  sev:     Severity
  msg:     string
  rule:    string
  /** defense yang bisa memblokir event ini secara otomatis */
  counter: DefenseType
}

export const BLUE_EVENTS: readonly BlueEvent[] = [
  { sev: 'high',     msg: 'SYN Flood detected on {asset}',               rule: 'NET-1001',  counter: 'firewall' },
  { sev: 'critical', msg: 'Ransomware execution on {asset}',             rule: 'EDR-9001',  counter: 'edr' },
  { sev: 'high',     msg: 'SQLi attempt on {asset} web portal',          rule: 'WAF-4421',  counter: 'waf' },
  { sev: 'medium',   msg: 'Brute force SSH: {asset} — {n} attempts',     rule: 'AUTH-2201', counter: 'ids' },
  { sev: 'high',     msg: 'C2 beacon outbound from {asset}',             rule: 'NET-3301',  counter: 'ti' },
  { sev: 'critical', msg: 'Lateral movement detected: {asset}',          rule: 'EDR-8801',  counter: 'edr' },
  { sev: 'medium',   msg: 'Anomalous data transfer on {asset}',          rule: 'DLP-5501',  counter: 'siem' },
  { sev: 'high',     msg: 'Zero-day exploit attempt on {asset}',         rule: 'IPS-7701',  counter: 'ips' },
  { sev: 'low',      msg: 'Port scan from SG ASN on {asset}',            rule: 'NET-1101',  counter: 'firewall' },
  { sev: 'critical', msg: 'Exfil attempt — {size}MB via DNS on {asset}', rule: 'DLP-5601',  counter: 'soar' },
]

export const CVES = ['CVE-2024-3094', 'CVE-2024-3400', 'CVE-2023-4966', 'CVE-2024-21762', 'CVE-2023-46805', 'CVE-2024-1709']
export const PORTS = [22, 80, 443, 445, 3389, 8080, 8443, 502, 1433, 5432]

export const THREAT_ACTORS = ['LION-SPIDER', 'MERLION-APT', 'STRAIT-PANDA', 'GARDEN-CITY', 'RED-DOT-KITTEN']

/** Isi placeholder template dengan nilai. */
export function fillTemplate(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`))
}
