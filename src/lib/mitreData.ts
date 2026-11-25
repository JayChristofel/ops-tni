import type { MitreEntry } from './types'

/** Urutan tactic untuk grouping heatmap. */
export const MITRE_TACTICS = [
  'Reconnaissance',
  'Initial Access',
  'Execution',
  'Persistence',
  'Privilege Escalation',
  'Defense Evasion',
  'Lateral Movement',
  'Command & Control',
  'Exfiltration',
  'Impact',
] as const

export const MITRE_INITIAL: MitreEntry[] = [
  // Reconnaissance / Discovery
  { techniqueId: 'T1595', name: 'Active Scanning',       tactic: 'Reconnaissance',       intensity: 0 },
  { techniqueId: 'T1046', name: 'Network Svc Discovery', tactic: 'Reconnaissance',       intensity: 0 },
  // Initial Access
  { techniqueId: 'T1566', name: 'Phishing',              tactic: 'Initial Access',       intensity: 0 },
  { techniqueId: 'T1190', name: 'Exploit Public-Facing', tactic: 'Initial Access',       intensity: 0 },
  { techniqueId: 'T1078', name: 'Valid Accounts',        tactic: 'Initial Access',       intensity: 0 },
  // Execution
  { techniqueId: 'T1059', name: 'Command Interpreter',   tactic: 'Execution',            intensity: 0 },
  { techniqueId: 'T1203', name: 'Exploitation for Code', tactic: 'Execution',            intensity: 0 },
  // Persistence
  { techniqueId: 'T1053', name: 'Scheduled Task/Job',    tactic: 'Persistence',          intensity: 0 },
  { techniqueId: 'T1547', name: 'Boot Autostart',        tactic: 'Persistence',          intensity: 0 },
  // Privilege Escalation
  { techniqueId: 'T1068', name: 'Exploit for PrivEsc',   tactic: 'Privilege Escalation', intensity: 0 },
  // Defense Evasion
  { techniqueId: 'T1562', name: 'Impair Defenses',       tactic: 'Defense Evasion',      intensity: 0 },
  // Lateral Movement
  { techniqueId: 'T1021', name: 'Remote Services',       tactic: 'Lateral Movement',     intensity: 0 },
  // Command & Control
  { techniqueId: 'T1071', name: 'App Layer Protocol',    tactic: 'Command & Control',    intensity: 0 },
  { techniqueId: 'T1572', name: 'Protocol Tunneling',    tactic: 'Command & Control',    intensity: 0 },
  // Exfiltration
  { techniqueId: 'T1041', name: 'Exfil Over C2',         tactic: 'Exfiltration',         intensity: 0 },
  { techniqueId: 'T1567', name: 'Exfil Over Web Svc',    tactic: 'Exfiltration',         intensity: 0 },
  // Impact
  { techniqueId: 'T1486', name: 'Data Encrypted',        tactic: 'Impact',               intensity: 0 },
  { techniqueId: 'T1489', name: 'Service Stop',          tactic: 'Impact',               intensity: 0 },
]

export function mitreLevel(intensity: number): { label: string; color: string } {
  if (intensity >= 8) return { label: 'CRIT', color: 'text-danger' }
  if (intensity >= 5) return { label: 'HIGH', color: 'text-warn' }
  if (intensity >= 2) return { label: 'MED',  color: 'text-purple' }
  return { label: 'LOW', color: 'text-muted' }
}
