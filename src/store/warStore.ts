import { create } from 'zustand'
import { SG_TARGETS, ID_ASSETS, SECTOR_META, SECTOR_ORDER, shortName } from '@/lib/sectorData'
import { BLUE_EVENTS, CVES, PORTS, RED_EVENTS, THREAT_ACTORS, fillTemplate } from '@/lib/eventPool'
import { MITRE_INITIAL } from '@/lib/mitreData'
import { KILL_CHAIN_STEPS, PHASE_INDEX, PHASE_OUTPUT } from '@/lib/killChain'
import { PAYLOAD_TEMPLATES } from '@/lib/payloads'
import { DEFAULT_BLUE_OPS, OPS_STAGES, STAGE_INDEX, type OpsRun, type OpsStage } from '@/lib/cyberOps'
import { blueStep, redPhaseSteps, type OpsStep, type StepResult } from '@/lib/opsActions'
import {
  clamp, pick, rand, randInt, randomHex, randomSgIp, statusFromCompromise, statusFromHealth, defStatus, uid,
} from '@/lib/utils'
import type {
  Alert, AlertAction, C2Action, C2Session, DefenseType, ExfilDataset, IDAsset, IOC, IOCAction, KillPhase,
  LogEntry, LogPrefix, MitreEntry, PayloadState, Sector, SectorId, SGTarget, TerminalLine, ThreatLevel, ToastEntry,
} from '@/lib/types'

// ============================================================
// Constants
// ============================================================

export const SECTOR_COOLDOWN_MS = 30_000
const MAX_LOG = 100
const MAX_ALERTS = 50
const MAX_TERMINAL = 200
const MAX_IOCS = 30
const MAX_TOASTS = 3

export const DEFENSE_KEYS = {
  firewall: 'firewallOn',
  ids:      'idsOn',
  ips:      'ipsOn',
  waf:      'wafOn',
  edr:      'edrOn',
  siem:     'siemOn',
  ti:       'tiOn',
  soar:     'soarOn',
} as const satisfies Record<DefenseType, string>

export const DEFENSE_LABEL: Record<DefenseType, string> = {
  firewall: 'FW', ids: 'IDS', ips: 'IPS', waf: 'WAF', edr: 'EDR', siem: 'SIEM', ti: 'TI', soar: 'SOAR',
}

type DefenseFlags = { [K in (typeof DEFENSE_KEYS)[DefenseType]]: boolean }

const DATASET_NAMES = [
  'flight_plans.db', 'swift_msgs.tar', 'grid_topology.xml', 'personnel.csv', 'netflow.pcap',
  'mail_archive.pst', 'scada_tags.json', 'vpn_creds.kdbx', 'cdr_records.parquet', 'gis_layers.zip',
]
const IOC_DOMAINS = ['sg-cdn-update.net', 'merlion-sync.io', 'strait-telemetry.com', 'lionsgate-api.org', 'gardencloud.app']

// ============================================================
// State & Actions
// ============================================================

export interface WarState extends DefenseFlags {
  // Global
  tick:            number
  paused:          boolean
  threatLevel:     ThreatLevel
  conflictSeconds: number
  redOpsActive:    number
  blueIncidents:   number
  exfilTotal:      number
  threatsBlocked:  number
  attackLog:       LogEntry[]
  toasts:          ToastEntry[]

  // Red Team
  sgTargets:        SGTarget[]
  selectedTargetId: string | null
  c2Sessions:       C2Session[]
  activePhase:      KillPhase
  payloads:         PayloadState[]
  exfilDatasets:    ExfilDataset[]
  terminal:         TerminalLine[]

  // Blue Team
  idAssets:           IDAsset[]
  sectors:            Sector[]
  alerts:             Alert[]
  mitreData:          MitreEntry[]
  iocs:               IOC[]
  activeSectorFilter: SectorId | null
  actionsTaken:       number
  blueStage:          OpsStage
  blueOps:            Record<string, boolean>
  /** eksekusi otomatis tahap yang sedang berjalan */
  redRun:             OpsRun | null
  blueRun:            OpsRun | null
  /** console output kegiatan Blue */
  blueConsole:        TerminalLine[]
  /** hasil terakhir per kegiatan Blue */
  blueResults:        Record<string, string>
}

export interface WarActions {
  doTick:          () => void
  togglePause:     () => void

  selectTarget:    (id: string) => void
  setPhase:        (phase: KillPhase) => void
  deployPayload:   (payloadId: string, targetId: string | null) => void
  c2Action:        (sessionId: string, action: C2Action) => void
  clearTerminal:   () => void

  setSectorFilter: (id: SectorId | null) => void
  deploySectorDef: (id: SectorId) => void
  handleAlert:     (alertId: string, action: AlertAction) => void
  toggleDefense:   (key: DefenseType) => void
  setBlueStage:    (stage: OpsStage) => void
  toggleBlueOp:    (id: string) => void
  runRedStage:     (stage: OpsStage, phase?: KillPhase) => void
  runBlueStage:    (stage: OpsStage) => void
  runBlueActivity: (id: string) => void
  clearBlueConsole: () => void
  runIRAction:     (action: string) => void
  iocAction:       (iocId: string, action: IOCAction) => void
  addIOC:          (ioc: Omit<IOC, 'id' | 'ts' | 'actions'>) => void

  addLog:          (entry: Omit<LogEntry, 'id' | 'ts'>) => void
  addToast:        (entry: Omit<ToastEntry, 'id'>) => void
  dismissToast:    (id: string) => void
}

export type WarStore = WarState & WarActions

// ============================================================
// Helpers
// ============================================================

let alertCounter = 0

function computeSectors(assets: IDAsset[], alerts: Alert[], prev: Sector[]): Sector[] {
  return SECTOR_ORDER.map(id => {
    const meta = SECTOR_META[id]
    const list = assets.filter(a => a.sectorId === id)
    const avg = list.length ? list.reduce((s, a) => s + a.healthPercent, 0) / list.length : 100
    const prevSec = prev.find(p => p.id === id)
    return {
      id,
      label:             meta.label,
      icon:              meta.icon,
      clusterPos:        meta.clusterPos,
      assets:            list,
      avgHealth:         avg,
      assetsUnderAttack: list.filter(a => a.underAttack).length,
      openIncidents:     alerts.filter(al => al.sectorId === id && !al.ack).length,
      status:            defStatus(avg),
      defenseDeployedAt: prevSec?.defenseDeployedAt ?? null,
    }
  })
}

function threatFromHealth(avg: number, openCritical: number): ThreatLevel {
  let lvl: ThreatLevel = avg > 90 ? 1 : avg > 78 ? 2 : avg > 62 ? 3 : avg > 45 ? 4 : 5
  if (openCritical >= 5 && lvl < 5) lvl = (lvl + 1) as ThreatLevel
  return lvl
}

const mkLog = (e: Omit<LogEntry, 'id' | 'ts'>, ts = Date.now()): LogEntry => ({ ...e, id: uid('log'), ts })
const mkTerm = (prefix: LogPrefix | '', text: string): TerminalLine => ({ id: uid('t'), ts: Date.now(), prefix, text })

function splitPrefix(line: string): TerminalLine {
  const m = line.match(/^(\[[*+\-!#>✗]\])\s(.*)$/)
  return m ? mkTerm(m[1] as LogPrefix, m[2]) : mkTerm('', line)
}

function mkC2(target: SGTarget, now: number): C2Session {
  const host = target.name.split(' – ')[0].toLowerCase().replace(/[^a-z]/g, '')
  return {
    id:         uid('c2'),
    targetId:   target.id,
    targetName: target.name,
    hostname:   `${host}-${pick(['srv', 'ws', 'dc', 'app', 'db'])}${randInt(1, 40).toString().padStart(2, '0')}`,
    ip:         `10.${randInt(0, 40)}.${randInt(0, 255)}.${randInt(2, 254)}`,
    protocol:   pick(['http', 'dns', 'tcp', 'icmp'] as const),
    interval:   randInt(5, 60),
    startedAt:  now,
    lastBeacon: now,
    dataBytes:  0,
    active:     true,
  }
}

function mkIOC(): Omit<IOC, 'id' | 'ts' | 'actions'> {
  const type = pick(['ip', 'domain', 'hash', 'url'] as const)
  const value =
    type === 'ip'     ? randomSgIp() :
    type === 'domain' ? pick(IOC_DOMAINS) :
    type === 'hash'   ? randomHex(32) :
                        `https://${pick(IOC_DOMAINS)}/${randomHex(6)}/gate.php`
  return { type, value, threat: pick(THREAT_ACTORS), confidence: randInt(55, 99) }
}

// ============================================================
// Initial State (deterministic — safe for prerender)
// ============================================================

const INITIAL_ASSETS = ID_ASSETS.map(a => ({ ...a }))

export const INITIAL_STATE: WarState = {
  tick:            0,
  paused:          false,
  threatLevel:     1,
  conflictSeconds: 0,
  redOpsActive:    0,
  blueIncidents:   0,
  exfilTotal:      0,
  threatsBlocked:  0,
  attackLog:       [],
  toasts:          [],

  sgTargets:        SG_TARGETS.map(t => ({ ...t })),
  selectedTargetId: 'sg-01',
  c2Sessions:       [],
  activePhase:      'recon',
  payloads:         PAYLOAD_TEMPLATES.map(p => ({ ...p })),
  exfilDatasets:    [],
  terminal: [
    { id: 't-boot-1', ts: 0, prefix: '[*]', text: 'C2 console siap — pilih target, lalu klik tahap operasi untuk menjalankan' },
  ],

  idAssets:           INITIAL_ASSETS,
  sectors:            computeSectors(INITIAL_ASSETS, [], []),
  alerts:             [],
  mitreData:          MITRE_INITIAL.map(m => ({ ...m })),
  iocs:               [],
  activeSectorFilter: null,
  actionsTaken:       0,
  blueStage:          'perencanaan',
  blueOps:            { ...DEFAULT_BLUE_OPS },
  redRun:             null,
  blueRun:            null,
  blueConsole:        [{ id: 'bc-init', ts: 0, prefix: '[*]', text: 'Blue SOC console siap — klik tahap untuk menjalankan kegiatan' }],
  blueResults:        {},

  firewallOn: true,
  idsOn:      true,
  ipsOn:      false,
  wafOn:      true,
  edrOn:      true,
  siemOn:     true,
  tiOn:       false,
  soarOn:     false,
}

// ============================================================
// Store
// ============================================================

export const useWarStore = create<WarStore>()((set, get) => ({
  ...INITIAL_STATE,

  // ----------------------------------------------------------
  // Main simulation tick (setiap 2 detik)
  // ----------------------------------------------------------
  doTick: () => {
    const s = get()
    if (s.paused) return
    const now = Date.now()
    const logs: LogEntry[] = []
    const defOn = (k: DefenseType) => s[DEFENSE_KEYS[k]]

    const sgTargets = s.sgTargets.map(t => ({ ...t }))
    let c2Sessions = s.c2Sessions.map(c => ({ ...c }))
    const exfilDatasets = s.exfilDatasets.map(d => ({ ...d }))
    const mitre = new Map(s.mitreData.map(m => [m.techniqueId, { ...m }]))
    const idAssets = s.idAssets.map(a => ({ ...a }))
    let alerts = [...s.alerts]
    let iocs = [...s.iocs]
    let payloads = s.payloads
    let exfilTotal = s.exfilTotal
    let threatsBlocked = s.threatsBlocked

    if (s.tick === 0) {
      logs.push(mkLog({ team: 'SYS', prefix: '[*]', severity: 'low', msg: 'Simulation started — Operasi Latihan Kogabwilhan I' }, now))
    }

    // 1. conflict clock
    const conflictSeconds = s.conflictSeconds + 2

    // 2. RED events (1–3)
    sgTargets.forEach(t => { if (t.underAttack && Math.random() < 0.3) t.underAttack = false })
    const nRed = randInt(1, 3)
    for (let i = 0; i < nRed; i++) {
      const selected = sgTargets.find(t => t.id === s.selectedTargetId)
      const target = selected && Math.random() < 0.5 ? selected : pick(sgTargets)
      const next = pick(sgTargets.filter(t => t.id !== target.id))
      const ev = pick(RED_EVENTS)
      const size = randInt(5, 120)
      const msg = fillTemplate(ev.msg, {
        target: target.name, port: pick(PORTS), cve: pick(CVES), interval: randInt(5, 60), size, next: next.name,
      })

      target.underAttack = true
      target.compromisePercent = clamp(Math.round(target.compromisePercent + ev.gain * rand(0.5, 1.5)))

      switch (ev.effect) {
        case 'session':
        case 'beacon': {
          const count = c2Sessions.filter(c => c.targetId === target.id).length
          if (count < 3 && c2Sessions.length < 12) c2Sessions.push(mkC2(target, now))
          break
        }
        case 'exfil':
          if (target.compromisePercent >= 25) {
            exfilDatasets.push({
              id: uid('ds'), targetId: target.id, name: pick(DATASET_NAMES),
              sizeMB: size, transferredMB: 0, status: 'pending',
            })
          }
          break
        case 'pivot':
          next.compromisePercent = clamp(next.compromisePercent + 1)
          next.underAttack = true
          break
      }

      const m = mitre.get(ev.tech)
      if (m) m.intensity = clamp(m.intensity + randInt(1, 2), 0, 10)

      const severity = ev.prefix === '[+]' ? 'high' : ev.prefix === '[!]' ? 'critical' : 'medium'
      logs.push(mkLog({ team: ev.team, prefix: ev.prefix, msg, severity, techniqueId: ev.tech }, now))
    }

    // exfil transfer progress
    for (const d of exfilDatasets) {
      if (d.status === 'done') continue
      if (d.status === 'pending' && Math.random() < 0.5) { d.status = 'in-progress'; continue }
      if (d.status === 'in-progress') {
        const delta = Math.min(d.sizeMB - d.transferredMB, rand(2, 15))
        d.transferredMB += delta
        exfilTotal += delta
        const t = sgTargets.find(x => x.id === d.targetId)
        if (t) t.dataExfil += delta
        if (d.transferredMB >= d.sizeMB - 0.01) {
          d.status = 'done'
          logs.push(mkLog({ team: 'RED', prefix: '[+]', severity: 'high', msg: `Exfil complete: ${d.name} (${d.sizeMB}MB)`, techniqueId: 'T1041' }, now))
        }
      }
    }

    // C2 beacons
    c2Sessions.forEach(c => {
      if (c.active) {
        if (Math.random() < 0.04) {
          c.active = false
          logs.push(mkLog({ team: 'C2', prefix: '[-]', severity: 'medium', msg: `Session lost: ${c.hostname} — reconnecting...` }, now))
        } else {
          c.lastBeacon = now
          c.dataBytes += randInt(200, 4000)
        }
      } else if (Math.random() < 0.3) {
        c.active = true
        c.lastBeacon = now
        logs.push(mkLog({ team: 'C2', prefix: '[+]', severity: 'medium', msg: `Session restored: ${c.hostname}` }, now))
      }
    })
    sgTargets.forEach(t => {
      t.c2Sessions = c2Sessions.filter(c => c.targetId === t.id && c.active).length
      t.status = statusFromCompromise(t.compromisePercent)
    })

    // deployed payloads may be detected
    if (payloads.some(p => p.status === 'DEPLOYED')) {
      payloads = payloads.map(p => {
        if (p.status === 'DEPLOYED' && Math.random() < (s.edrOn ? 0.1 : 0.03)) {
          logs.push(mkLog({ team: 'RED', prefix: '[-]', severity: 'medium', msg: `${p.name} signature flagged by defender EDR` }, now))
          return { ...p, status: 'DETECTED' as const }
        }
        return p
      })
    }

    // 3. BLUE events (1–2)
    idAssets.forEach(a => { if (a.underAttack && Math.random() < 0.25) a.underAttack = false })
    const nBlue = randInt(1, 2)
    for (let i = 0; i < nBlue; i++) {
      const asset = pick(idAssets)
      const ev = pick(BLUE_EVENTS)
      const msg = fillTemplate(ev.msg, { asset: shortName(asset.name, 30), n: randInt(50, 900), size: randInt(4, 80) })
      const blocked = defOn(ev.counter) && Math.random() < 0.45

      if (blocked) {
        threatsBlocked++
        logs.push(mkLog({ team: 'BLUE', prefix: '[+]', severity: 'low', msg: `${DEFENSE_LABEL[ev.counter]} blocked: ${msg}` }, now))
      } else {
        asset.underAttack = true
        asset.lastIncident = now
        alerts.push({
          id: uid('al'), num: ++alertCounter, ts: now,
          sectorId: asset.sectorId, assetId: asset.id, assetName: asset.name,
          severity: ev.sev, msg, rule: ev.rule, srcIp: randomSgIp(), ack: false, action: null,
        })
        logs.push(mkLog({ team: 'BLUE', prefix: '[!]', severity: ev.sev, msg: `${ev.rule} · ${msg}` }, now))
      }

      if (Math.random() < 0.3) {
        iocs.push({ ...mkIOC(), id: uid('ioc'), ts: now, actions: [] })
      }
    }

    // 4. asset health
    const defCount = (Object.keys(DEFENSE_KEYS) as DefenseType[]).filter(defOn).length
    const opsActive = Object.values(s.blueOps).filter(Boolean).length
    const mitigation = Math.min(0.8, defCount * 0.06 + opsActive * 0.01)
    const sectorsPrev = s.sectors.map(sec => ({
      ...sec,
      defenseDeployedAt:
        sec.defenseDeployedAt && now - sec.defenseDeployedAt >= SECTOR_COOLDOWN_MS ? null : sec.defenseDeployedAt,
    }))
    idAssets.forEach(a => {
      const sec = sectorsPrev.find(x => x.id === a.sectorId)
      a.defenseActive = !!sec?.defenseDeployedAt
      if (a.underAttack && !a.defenseActive) {
        a.healthPercent = clamp(a.healthPercent - rand(1.5, 5) * (1 - mitigation))
      } else if (!a.underAttack) {
        a.healthPercent = clamp(a.healthPercent + (a.defenseActive ? 1.2 : 0.5))
      }
      a.status = statusFromHealth(a.healthPercent)
    })

    // 5. MITRE intensity drift
    mitre.forEach(m => { m.intensity = clamp(m.intensity + pick([-1, 0, 0, 1]), 0, 10) })

    // 6. trims + computed
    alerts = alerts.slice(-MAX_ALERTS)
    iocs = iocs.slice(-MAX_IOCS)
    c2Sessions = c2Sessions.slice(-12)
    const sectors = computeSectors(idAssets, alerts, sectorsPrev)

    // 7. threat level
    const avgHealth = idAssets.reduce((sum, a) => sum + a.healthPercent, 0) / idAssets.length
    const openCritical = alerts.filter(a => !a.ack && a.severity === 'critical').length
    const threatLevel = threatFromHealth(avgHealth, openCritical)
    if (threatLevel > s.threatLevel) {
      logs.push(mkLog({ team: 'SYS', prefix: '[!]', severity: 'high', msg: `Threat level raised to ${threatLevel}` }, now))
    }

    set({
      tick: s.tick + 1,
      conflictSeconds,
      sgTargets,
      c2Sessions,
      exfilDatasets: exfilDatasets.slice(-40),
      exfilTotal,
      payloads,
      idAssets,
      sectors,
      alerts,
      iocs,
      mitreData: Array.from(mitre.values()),
      threatsBlocked,
      threatLevel,
      redOpsActive: sgTargets.filter(t => t.underAttack).length + c2Sessions.filter(c => c.active).length,
      blueIncidents: alerts.filter(a => !a.ack).length,
      // 8. trim log
      attackLog: [...s.attackLog, ...logs].slice(-MAX_LOG),
    })
  },

  togglePause: () => {
    const paused = !get().paused
    set({ paused })
    get().addLog({ team: 'SYS', prefix: paused ? '[-]' : '[+]', severity: 'low', msg: paused ? 'Simulation paused' : 'Simulation resumed' })
  },

  // ----------------------------------------------------------
  // Red Team
  // ----------------------------------------------------------
  selectTarget: id => {
    const t = get().sgTargets.find(x => x.id === id)
    if (!t) return
    set(s => ({
      selectedTargetId: id,
      activePhase: t.killPhase,
      terminal: [...s.terminal, mkTerm('[*]', `Target locked: [${t.id.toUpperCase()}] ${t.name}`)].slice(-MAX_TERMINAL),
    }))
  },

  setPhase: phase => {
    const s = get()
    const id = s.selectedTargetId
    if (!id) return
    const target = s.sgTargets.find(t => t.id === id)!
    const step = KILL_CHAIN_STEPS[PHASE_INDEX[phase]]
    const forward = PHASE_INDEX[phase] > PHASE_INDEX[target.killPhase]
    const lines = [mkTerm('[>]', `phase ${step.short.toLowerCase()} --target ${id}`), ...PHASE_OUTPUT[phase].map(splitPrefix)]

    set({
      activePhase: phase,
      sgTargets: s.sgTargets.map(t =>
        t.id === id
          ? {
              ...t,
              killPhase: phase,
              underAttack: true,
              compromisePercent: forward ? clamp(t.compromisePercent + randInt(3, 8)) : t.compromisePercent,
            }
          : t,
      ),
      terminal: [...s.terminal, ...lines].slice(-MAX_TERMINAL),
    })
    get().addLog({ team: 'RED', prefix: '[*]', severity: 'medium', msg: `Kill chain → ${step.label} on ${target.name}` })
  },

  deployPayload: (payloadId, targetId) => {
    const s = get()
    const p = s.payloads.find(x => x.id === payloadId)
    const target = s.sgTargets.find(t => t.id === targetId)
    if (!p || !target) return

    if (p.status === 'DETECTED') {
      set({ payloads: s.payloads.map(x => (x.id === payloadId ? { ...x, status: 'LOADED' } : x)) })
      set(st => ({ terminal: [...st.terminal, mkTerm('[*]', `${p.name} re-obfuscated → LOADED`)].slice(-MAX_TERMINAL) }))
      return
    }

    const gain = p.rating * randInt(2, 4)
    set({
      payloads: s.payloads.map(x => (x.id === payloadId ? { ...x, status: 'DEPLOYED' } : x)),
      sgTargets: s.sgTargets.map(t =>
        t.id === target.id ? { ...t, underAttack: true, compromisePercent: clamp(t.compromisePercent + gain) } : t,
      ),
      terminal: [
        ...s.terminal,
        mkTerm('[>]', `deploy ${p.name.replace(/\s/g, '_').toLowerCase()} --target ${target.id}`),
        mkTerm('[*]', `Uploading ${p.size} stager...`),
        mkTerm('[+]', `${p.name} deployed on ${target.name} (+${gain}% compromise)`),
      ].slice(-MAX_TERMINAL),
    })
    get().addLog({ team: 'RED', prefix: '[+]', severity: 'high', msg: `Payload ${p.name} deployed on ${target.name}` })
    get().addToast({ team: 'RED', variant: 'danger', msg: `Payload ${p.name} deployed on [${target.id.toUpperCase()}]` })
  },

  c2Action: (sessionId, action) => {
    const s = get()
    const c = s.c2Sessions.find(x => x.id === sessionId)
    if (!c) return
    if (action === 'kill') {
      set({ c2Sessions: s.c2Sessions.filter(x => x.id !== sessionId) })
      get().addLog({ team: 'C2', prefix: '[-]', severity: 'low', msg: `Session ${c.hostname} terminated by operator` })
      return
    }
    if (action === 'shell') {
      set({
        terminal: [
          ...s.terminal,
          mkTerm('[>]', `interact ${c.hostname} (${c.protocol})`),
          mkTerm('', `${c.hostname}$ whoami → svc_${c.protocol}`),
          mkTerm('', `${c.hostname}$ hostname → ${c.hostname}.${c.targetId}.local`),
        ].slice(-MAX_TERMINAL),
      })
      return
    }
    // pivot
    const others = s.sgTargets.filter(t => t.id !== c.targetId)
    const next = pick(others)
    set({
      sgTargets: s.sgTargets.map(t =>
        t.id === next.id ? { ...t, underAttack: true, compromisePercent: clamp(t.compromisePercent + randInt(3, 7)) } : t,
      ),
      terminal: [...s.terminal, mkTerm('[#]', `Pivot ${c.hostname} → ${next.name}`)].slice(-MAX_TERMINAL),
    })
    get().addLog({ team: 'INTEL', prefix: '[#]', severity: 'medium', msg: `Pivot path: ${c.targetName} → ${next.name}`, techniqueId: 'T1021' })
  },

  clearTerminal: () => set({ terminal: [] }),

  // ----------------------------------------------------------
  // Blue Team
  // ----------------------------------------------------------
  setSectorFilter: id => set(s => ({ activeSectorFilter: s.activeSectorFilter === id ? null : id })),

  deploySectorDef: id => {
    const s = get()
    const now = Date.now()
    const sec = s.sectors.find(x => x.id === id)
    if (sec?.defenseDeployedAt && now - sec.defenseDeployedAt < SECTOR_COOLDOWN_MS) return
    const idAssets = s.idAssets.map(a =>
      a.sectorId === id
        ? { ...a, healthPercent: clamp(a.healthPercent + 10), defenseActive: true, status: statusFromHealth(clamp(a.healthPercent + 10)) }
        : a,
    )
    const prev = s.sectors.map(x => (x.id === id ? { ...x, defenseDeployedAt: now } : x))
    set({ idAssets, sectors: computeSectors(idAssets, s.alerts, prev), actionsTaken: s.actionsTaken + 1 })
    const label = SECTOR_META[id].label
    get().addLog({ team: 'BLUE', prefix: '[+]', severity: 'low', msg: `Sector ${label} defense deployed` })
    get().addToast({ team: 'BLUE', variant: 'success', msg: `Sector ${label} defense activated` })
  },

  handleAlert: (alertId, action) => {
    const s = get()
    const al = s.alerts.find(a => a.id === alertId)
    if (!al) return
    let idAssets = s.idAssets
    let threatsBlocked = s.threatsBlocked
    let iocs = s.iocs

    if (action === 'ISOLATE HOST') {
      idAssets = idAssets.map(a => (a.id === al.assetId ? { ...a, underAttack: false } : a))
      threatsBlocked++
    } else if (action === 'BLOCK IP') {
      threatsBlocked++
      iocs = [...iocs, { id: uid('ioc'), ts: Date.now(), type: 'ip' as const, value: al.srcIp, threat: 'SOC-BLOCKED', confidence: 90, actions: ['ADD BLOCKLIST' as const] }].slice(-MAX_IOCS)
    }

    const alerts = action === 'FALSE POS'
      ? s.alerts.filter(a => a.id !== alertId)
      : s.alerts.map(a => (a.id === alertId ? { ...a, ack: true, action } : a))

    set({
      alerts, idAssets, threatsBlocked, iocs,
      actionsTaken: s.actionsTaken + 1,
      blueIncidents: alerts.filter(a => !a.ack).length,
      sectors: computeSectors(idAssets, alerts, s.sectors),
    })

    const num = `#${al.num.toString().padStart(4, '0')}`
    const verb: Record<AlertAction, string> = {
      'ISOLATE HOST': 'ISOLATING host',
      'ESCALATE':     'ESCALATED to BSSN —',
      'INVESTIGATE':  'INVESTIGATING',
      'BLOCK IP':     `BLOCKING ${al.srcIp} on`,
      'FALSE POS':    'closed as false positive —',
      'MARK READ':    'marked read —',
    }
    const msg = `Alert ${num} → ${verb[action]} ${shortName(al.assetName, 28)}`
    get().addLog({ team: 'BLUE', prefix: '[>]', severity: 'low', msg })
    if (action !== 'MARK READ') get().addToast({ team: 'BLUE', variant: 'info', msg })
  },

  toggleDefense: key => {
    const s = get()
    const field = DEFENSE_KEYS[key]
    const on = !s[field]
    set({ [field]: on } as Partial<WarState>)
    const label = DEFENSE_LABEL[key]
    if (on) {
      get().addLog({ team: 'BLUE', prefix: '[+]', severity: 'low', msg: `${label} enabled` })
      get().addToast({ team: 'BLUE', variant: 'success', msg: `${label} enabled — coverage restored` })
    } else {
      const now = Date.now()
      const alerts = [...s.alerts, {
        id: uid('al'), num: ++alertCounter, ts: now, sectorId: 'government' as const, assetId: 'id-12',
        assetName: 'SOC Control Plane', severity: 'high' as const, msg: `${label} disabled — threat surface increased`,
        rule: 'SOC-0001', srcIp: '127.0.0.1', ack: false, action: null,
      }].slice(-MAX_ALERTS)
      set({ alerts, blueIncidents: alerts.filter(a => !a.ack).length })
      get().addLog({ team: 'WARN', prefix: '[!]', severity: 'high', msg: `${label} disabled — threat surface increased` })
      get().addToast({ team: 'WARN', variant: 'warn', msg: `${label} disabled — threat surface increased` })
    }
  },

  setBlueStage: stage => set({ blueStage: stage }),

  toggleBlueOp: id => {
    const s = get()
    const act = OPS_STAGES.flatMap(st => st.blue.map(a => ({ ...a, stage: st })))
      .find(a => a.id === id)
    if (!act) return
    const on = !s.blueOps[id]
    set({ blueOps: { ...s.blueOps, [id]: on }, actionsTaken: s.actionsTaken + 1 })
    const msg = `${act.stage.label} · ${act.label} ${on ? 'diaktifkan' : 'dinonaktifkan'}`
    get().addLog({ team: on ? 'BLUE' : 'WARN', prefix: on ? '[+]' : '[!]', severity: 'low', msg })
    get().addToast({ team: on ? 'BLUE' : 'WARN', variant: on ? 'success' : 'warn', msg })
  },

  runRedStage: (stage, onlyPhase) => {
    const s = get()
    if (s.redRun) {
      get().addToast({ team: 'RED', variant: 'warn', msg: 'Operasi Red sedang berjalan — tunggu selesai' })
      return
    }
    const target = s.sgTargets.find(t => t.id === s.selectedTargetId)
    if (!target) {
      get().addToast({ team: 'RED', variant: 'warn', msg: 'Pilih target SG terlebih dahulu' })
      return
    }
    const def = OPS_STAGES[STAGE_INDEX[stage]]
    const phases = onlyPhase ? [onlyPhase] : def.redPhases
    const steps = phases.flatMap(p => redPhaseSteps(p, target.id))
    const label = onlyPhase ? KILL_CHAIN_STEPS[PHASE_INDEX[onlyPhase]].label : def.label
    get().addLog({ team: 'RED', prefix: '[>]', severity: 'medium', msg: `Tahap ${def.label} dimulai → ${target.name}` })
    runSequence('redRun', stage, steps, 1100, () => {
      get().addLog({ team: 'RED', prefix: '[+]', severity: 'high', msg: `${label} selesai → ${target.name}` })
      get().addToast({ team: 'RED', variant: 'danger', msg: `${label} selesai · ${target.id.toUpperCase()}` })
    })
  },

  runBlueStage: stage => {
    const s = get()
    if (s.blueRun) {
      get().addToast({ team: 'BLUE', variant: 'warn', msg: 'Operasi Blue sedang berjalan — tunggu selesai' })
      return
    }
    const def = OPS_STAGES[STAGE_INDEX[stage]]
    set({ blueStage: stage })
    get().addLog({ team: 'BLUE', prefix: '[>]', severity: 'low', msg: `Tahap ${def.label} dimulai — ${def.blue.length} kegiatan dijalankan` })
    runParallel(stage, def.blue.map(blueStep), () => {
      get().addLog({ team: 'BLUE', prefix: '[+]', severity: 'low', msg: `Tahap ${def.label} selesai` })
      get().addToast({ team: 'BLUE', variant: 'success', msg: `Tahap ${def.label} selesai` })
    })
  },

  runBlueActivity: id => {
    const s = get()
    if (s.blueRun) {
      get().addToast({ team: 'BLUE', variant: 'warn', msg: 'Operasi Blue sedang berjalan — tunggu selesai' })
      return
    }
    const def = OPS_STAGES.find(st => st.blue.some(a => a.id === id))
    const act = def?.blue.find(a => a.id === id)
    if (!def || !act) return
    set({ blueStage: def.id })
    runParallel(def.id, [blueStep(act)], () => undefined)
  },

  clearBlueConsole: () => set({ blueConsole: [] }),

  runIRAction: action => {
    const s = get()
    let idAssets = s.idAssets
    let threatsBlocked = s.threatsBlocked
    let detail = ''
    const attacked = idAssets.filter(a => a.underAttack)

    switch (action) {
      case 'Block IP':
      case 'GeoBlock SG':
      case 'Rate Limit':
        threatsBlocked += action === 'GeoBlock SG' ? randInt(4, 9) : randInt(1, 3)
        detail = action === 'GeoBlock SG' ? 'SG ASN ranges dropped at edge' : 'edge policy updated'
        break
      case 'Honeypot':
        get().addIOC(mkIOC())
        detail = 'decoy captured new IOC'
        break
      case 'Isolate Host':
      case 'Kill Process':
      case 'Force Reboot': {
        const a = attacked[0]
        if (a) {
          idAssets = idAssets.map(x => (x.id === a.id ? { ...x, underAttack: false } : x))
          detail = shortName(a.name, 28)
        } else detail = 'no active intrusion'
        break
      }
      case 'Memory Dump':
        detail = 'forensic image queued'
        break
      case 'Deploy Patch':
        idAssets = idAssets.map(a => ({ ...a, healthPercent: clamp(a.healthPercent + 3) }))
        detail = 'all assets +3%'
        break
      case 'Restore Backup': {
        const worst = [...idAssets].sort((a, b) => a.healthPercent - b.healthPercent)[0]
        idAssets = idAssets.map(a => (a.id === worst.id ? { ...a, healthPercent: clamp(a.healthPercent + 20) } : a))
        detail = `${shortName(worst.name, 28)} +20%`
        break
      }
      case 'Failover':
        idAssets = idAssets.map(a => (a.status === 'critical' || a.status === 'compromised' ? { ...a, healthPercent: clamp(a.healthPercent + 8) } : a))
        detail = 'critical services moved to DR site'
        break
      case 'Escalate BSSN':
        detail = 'incident report sent to BSSN'
        break
    }

    idAssets = idAssets.map(a => ({ ...a, status: statusFromHealth(a.healthPercent) }))
    set({ idAssets, threatsBlocked, actionsTaken: s.actionsTaken + 1, sectors: computeSectors(idAssets, s.alerts, s.sectors) })
    get().addLog({ team: 'BLUE', prefix: '[>]', severity: 'low', msg: `IR: ${action} — ${detail}` })
    get().addToast({ team: 'BLUE', variant: 'info', msg: `IR ${action}: ${detail}` })
  },

  iocAction: (iocId, action) => {
    const s = get()
    const ioc = s.iocs.find(i => i.id === iocId)
    if (!ioc || ioc.actions.includes(action)) return
    set({
      iocs: s.iocs.map(i => (i.id === iocId ? { ...i, actions: [...i.actions, action] } : i)),
      threatsBlocked: action === 'REPORT' ? s.threatsBlocked : s.threatsBlocked + 1,
      actionsTaken: s.actionsTaken + 1,
    })
    const short = ioc.value.length > 28 ? ioc.value.slice(0, 27) + '…' : ioc.value
    const verb: Record<IOCAction, string> = {
      'ADD BLOCKLIST': 'blocked',
      'SINKHOLE':      'sinkholed',
      'ADD TO EDR':    'pushed to EDR',
      'REPORT':        'reported to BSSN',
    }
    const msg = `${ioc.type.toUpperCase()} ${short} ${verb[action]}`
    get().addLog({ team: 'INTEL', prefix: '[#]', severity: 'low', msg })
    get().addToast({ team: 'INTEL', variant: 'info', msg })
  },

  addIOC: ioc => set(s => ({ iocs: [...s.iocs, { ...ioc, id: uid('ioc'), ts: Date.now(), actions: [] }].slice(-MAX_IOCS) })),

  // ----------------------------------------------------------
  // Shared
  // ----------------------------------------------------------
  addLog: entry => set(s => ({ attackLog: [...s.attackLog, mkLog(entry)].slice(-MAX_LOG) })),

  addToast: entry => set(s => ({ toasts: [...s.toasts, { ...entry, id: uid('toast') }].slice(-MAX_TOASTS) })),

  dismissToast: id => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

// ============================================================
// Ops runner — jalankan langkah otomatis satu per satu
// ============================================================

/** Terapkan hasil sebuah langkah ke store (+ hitung ulang nilai turunan). */
function applyStep(r: StepResult) {
  const st = useWarStore.getState()
  const patch: Partial<WarState> = { ...r.patch }

  if (patch.idAssets) {
    patch.idAssets = patch.idAssets.map(a => ({ ...a, status: statusFromHealth(a.healthPercent) }))
  }
  const idAssets = patch.idAssets ?? st.idAssets
  const alerts = patch.alerts ?? st.alerts
  if (patch.idAssets || patch.alerts) {
    patch.sectors = computeSectors(idAssets, alerts, st.sectors)
    patch.blueIncidents = alerts.filter(a => !a.ack).length
  }
  if (patch.c2Sessions) {
    const c2 = patch.c2Sessions
    patch.sgTargets = (patch.sgTargets ?? st.sgTargets).map(t => ({
      ...t,
      c2Sessions: c2.filter(c => c.targetId === t.id && c.active).length,
    }))
  }
  if (patch.sgTargets || patch.c2Sessions) {
    patch.redOpsActive =
      (patch.sgTargets ?? st.sgTargets).filter(t => t.underAttack).length +
      (patch.c2Sessions ?? st.c2Sessions).filter(c => c.active).length
  }
  alertCounter = Math.max(alertCounter, alerts.reduce((m, a) => Math.max(m, a.num), 0))

  if (r.out?.length) {
    patch.blueConsole = [...st.blueConsole, ...r.out.map(([p, t]) => mkTerm(p, t))].slice(-MAX_TERMINAL)
  }
  const logs = (r.logs ?? []).map(l => mkLog(l))
  const term = (r.term ?? []).map(([p, t]) => mkTerm(p, t))
  useWarStore.setState({
    ...patch,
    attackLog: [...st.attackLog, ...logs].slice(-MAX_LOG),
    terminal: term.length ? [...st.terminal, ...term].slice(-MAX_TERMINAL) : st.terminal,
  })
}

function runSequence(key: 'redRun' | 'blueRun', stage: OpsStage, steps: OpsStep[], stepMs: number, onDone: () => void) {
  const total = steps.length
  const exec = (i: number) => {
    if (i >= total) {
      useWarStore.setState({ [key]: null } as Partial<WarState>)
      onDone()
      return
    }
    // langkah i tampil "running" selama stepMs, lalu efeknya diterapkan
    useWarStore.setState({ [key]: { stage, done: i, total, current: steps[i].id } } as Partial<WarState>)
    setTimeout(() => {
      applyStep(steps[i].run(useWarStore.getState()))
      exec(i + 1)
    }, stepMs)
  }
  exec(0)
}

/** Blue: semua kegiatan tahap mulai serentak, lalu selesai bergiliran. */
function runParallel(stage: OpsStage, steps: OpsStep[], onDone: () => void) {
  const total = steps.length
  const status: Record<string, 'running' | 'done'> = Object.fromEntries(steps.map(s => [s.id, 'running' as const]))
  let done = 0
  useWarStore.setState({ blueRun: { stage, done, total, current: steps[0]?.id ?? null, status: { ...status } } })
  steps.forEach((step, i) => {
    setTimeout(() => {
      applyStep(step.run(useWarStore.getState()))
      status[step.id] = 'done'
      done++
      if (done >= total) {
        useWarStore.setState({ blueRun: null })
        onDone()
      } else {
        useWarStore.setState({ blueRun: { stage, done, total, current: steps[i + 1]?.id ?? null, status: { ...status } } })
      }
    }, 1200 + i * 700)
  })
}
