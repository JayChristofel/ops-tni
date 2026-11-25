import type { KillPhase } from './types'

/** Pentahapan operasi siber (berlaku untuk Red dan Blue). */
export type OpsStage = 'perencanaan' | 'persiapan' | 'pelaksanaan' | 'pengendalian' | 'pencapaian'

/** Status eksekusi otomatis sebuah tahap. */
export interface OpsRun {
  stage:   OpsStage
  done:    number
  total:   number
  /** id langkah yang sedang berjalan */
  current: string | null
  /** status per kegiatan (Blue: semua kegiatan tahap berjalan serentak) */
  status?: Record<string, 'running' | 'done'>
}

export interface BlueActivity {
  id:    string
  label: string
}

export interface OpsStageDef {
  id:         OpsStage
  label:      string
  /** fase Cyber Kill Chain (Red) yang berada di tahap ini */
  redPhases:  KillPhase[]
  /** kegiatan defensif (Blue) di tahap ini */
  blue:       BlueActivity[]
  desc:       string
}

export const OPS_STAGES: OpsStageDef[] = [
  {
    id: 'perencanaan', label: 'PERENCANAAN', desc: 'Memahami permukaan serangan dan ancaman sebelum kontak',
    redPhases: ['recon'],
    blue: [
      { id: 'plan-asm',   label: 'Attack Surface Monitoring' },
      { id: 'plan-ti',    label: 'Threat Intelligence' },
      { id: 'plan-va',    label: 'Vulnerability Assessment' },
    ],
  },
  {
    id: 'persiapan', label: 'PERSIAPAN', desc: 'Menyiapkan sensor, kontrol, dan kemampuan analisis',
    redPhases: ['weaponize'],
    blue: [
      { id: 'prep-mal',   label: 'Malware Analysis' },
      { id: 'prep-email', label: 'Email Security' },
      { id: 'prep-web',   label: 'Web Filtering' },
      { id: 'prep-ips',   label: 'IDS/IPS' },
      { id: 'prep-edr',   label: 'EDR' },
      { id: 'prep-siem',  label: 'SIEM Preparation' },
    ],
  },
  {
    id: 'pelaksanaan', label: 'PELAKSANAAN', desc: 'Deteksi dan penahanan selama serangan berlangsung',
    redPhases: ['deliver', 'exploit', 'install'],
    blue: [
      { id: 'exec-email', label: 'Email Security' },
      { id: 'exec-web',   label: 'Web Filtering' },
      { id: 'exec-ips',   label: 'IDS/IPS' },
      { id: 'exec-edr',   label: 'Endpoint Detection' },
      { id: 'exec-fim',   label: 'File Integrity Monitoring' },
      { id: 'exec-net',   label: 'Network Monitoring' },
      { id: 'exec-dns',   label: 'DNS Monitoring' },
      { id: 'exec-ndr',   label: 'NDR' },
      { id: 'exec-siem',  label: 'SIEM' },
    ],
  },
  {
    id: 'pengendalian', label: 'PENGENDALIAN', desc: 'Memutus kendali musuh dan merespons insiden',
    redPhases: ['c2'],
    blue: [
      { id: 'ctrl-siem',  label: 'SIEM' },
      { id: 'ctrl-edr',   label: 'EDR' },
      { id: 'ctrl-fw',    label: 'Firewall/IPS' },
      { id: 'ctrl-dlp',   label: 'DLP' },
      { id: 'ctrl-dns',   label: 'DNS Security' },
      { id: 'ctrl-soar',  label: 'SOAR' },
      { id: 'ctrl-ir',    label: 'Incident Response' },
    ],
  },
  {
    id: 'pencapaian', label: 'PENCAPAIAN', desc: 'Menjamin misi, memulihkan, dan menarik pelajaran',
    redPhases: ['exfil'],
    blue: [
      { id: 'done-ma',    label: 'Mission Assurance' },
      { id: 'done-dp',    label: 'Data Protection' },
      { id: 'done-rec',   label: 'Recovery' },
      { id: 'done-dv',    label: 'Defense Validation' },
      { id: 'done-ll',    label: 'Lessons Learned' },
    ],
  },
]

export const STAGE_INDEX: Record<OpsStage, number> = Object.fromEntries(
  OPS_STAGES.map((s, i) => [s.id, i]),
) as Record<OpsStage, number>

export function stageOfPhase(phase: KillPhase): OpsStage {
  return OPS_STAGES.find(s => s.redPhases.includes(phase))!.id
}

/** Kegiatan Blue yang aktif sejak awal. */
export const DEFAULT_BLUE_OPS: Record<string, boolean> = Object.fromEntries(
  OPS_STAGES.flatMap(s => s.blue).map(a => [a.id, [
    'plan-asm', 'plan-ti', 'prep-email', 'prep-web', 'prep-ips', 'prep-edr', 'prep-siem',
    'exec-email', 'exec-web', 'exec-ips', 'exec-edr', 'exec-net', 'exec-siem', 'ctrl-siem', 'ctrl-edr', 'ctrl-fw',
  ].includes(a.id)]),
)
