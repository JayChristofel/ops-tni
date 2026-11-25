import type { WarState } from '@/store/warStore'
import type { BlueActivity } from './cyberOps'
import { CVES, THREAT_ACTORS } from './eventPool'
import { KILL_CHAIN_STEPS, PHASE_INDEX } from './killChain'
import { shortName } from './sectorData'
import type {
  Alert, AlertAction, C2Session, ExfilDataset, IOC, KillPhase, LogEntry, LogPrefix, MitreEntry, SGTarget, Severity, Team,
} from './types'
import { clamp, pick, randInt, randomHex, randomSgIp, statusFromCompromise, uid } from './utils'

// ============================================================
// Types
// ============================================================

export interface StepResult {
  patch?: Partial<WarState>
  logs?:  Omit<LogEntry, 'id' | 'ts'>[]
  term?:  [LogPrefix | '', string][]
  /** baris console Blue */
  out?:   [LogPrefix | '', string][]
}

/** Satu langkah otomatis dalam sebuah tahap operasi. */
export interface OpsStep {
  id:    string
  label: string
  run:   (s: WarState) => StepResult
}

// ============================================================
// Shared helpers
// ============================================================

const bumpMitre = (m: MitreEntry[], ids: string[], d: number): MitreEntry[] =>
  m.map(e => (ids.includes(e.techniqueId) ? { ...e, intensity: clamp(e.intensity + d, 0, 10) } : e))

/** Alert baru di sisi Blue (dipicu aksi Red). */
function blueAlert(s: WarState, severity: Severity, msg: string, rule: string): Pick<WarState, 'alerts' | 'idAssets'> {
  const asset = pick(s.idAssets)
  const now = Date.now()
  const num = s.alerts.reduce((m, a) => Math.max(m, a.num), 0) + 1
  const alert: Alert = {
    id: uid('al'), num, ts: now,
    sectorId: asset.sectorId, assetId: asset.id, assetName: asset.name,
    severity,
    msg: msg.replace('{asset}', shortName(asset.name, 30)).replace('{size}', String(randInt(20, 120))),
    rule, srcIp: randomSgIp(), ack: false, action: null,
  }
  return {
    alerts: [...s.alerts, alert].slice(-50),
    idAssets: s.idAssets.map(a => (a.id === asset.id ? { ...a, underAttack: true, lastIncident: now } : a)),
  }
}

function newC2(t: SGTarget): C2Session {
  const now = Date.now()
  const host = t.name.split(' – ')[0].toLowerCase().replace(/[^a-z]/g, '')
  return {
    id: uid('c2'), targetId: t.id, targetName: t.name,
    hostname: `${host}-${pick(['srv', 'ws', 'dc', 'app', 'db'])}${randInt(1, 40).toString().padStart(2, '0')}`,
    ip: `10.${randInt(0, 40)}.${randInt(0, 255)}.${randInt(2, 254)}`,
    protocol: pick(['http', 'dns', 'tcp', 'icmp'] as const),
    interval: randInt(5, 60), startedAt: now, lastBeacon: now, dataBytes: 0, active: true,
  }
}

const IOC_DOMAINS = ['sg-cdn-update.net', 'merlion-sync.io', 'strait-telemetry.com', 'lionsgate-api.org', 'gardencloud.app']
const DATASETS = ['flight_plans.db', 'swift_msgs.tar', 'grid_topology.xml', 'personnel.csv', 'netflow.pcap', 'scada_tags.json', 'vpn_creds.kdbx']

function newIoc(type?: IOC['type']): IOC {
  const t = type ?? pick(['ip', 'domain', 'hash', 'url'] as const)
  const value =
    t === 'ip'     ? randomSgIp() :
    t === 'domain' ? pick(IOC_DOMAINS) :
    t === 'hash'   ? randomHex(32) :
                     `https://${pick(IOC_DOMAINS)}/${randomHex(6)}/gate.php`
  return { id: uid('ioc'), ts: Date.now(), type: t, value, threat: pick(THREAT_ACTORS), confidence: randInt(60, 99), actions: [] }
}

// ============================================================
// RED — langkah otomatis per fase Cyber Kill Chain
// ============================================================

interface RedOpt {
  id:     string
  prefix: LogPrefix
  team?:  Team
  text:   (t: SGTarget) => string
  gain:   number
  tech?:  string
  mitre?: [string[], number]
  sev?:   Severity
  extra?: (s: WarState, t: SGTarget) => Partial<WarState>
  /** alert yang muncul di sisi Blue: [severity, pesan, rule] */
  blue?:  [Severity, string, string]
  /** langkah terakhir fase → menulis satu baris ringkasan ke terminal */
  final?: boolean
}

function redStep(phase: KillPhase, targetId: string, o: RedOpt): OpsStep {
  return {
    id: o.id,
    label: o.id,
    run: s => {
      const t = s.sgTargets.find(x => x.id === targetId)!
      const text = o.text(t)
      const patch: Partial<WarState> = {
        activePhase: phase,
        sgTargets: s.sgTargets.map(x => {
          if (x.id !== targetId) return x
          const c = clamp(x.compromisePercent + o.gain)
          return { ...x, killPhase: phase, underAttack: true, compromisePercent: c, status: statusFromCompromise(c) }
        }),
      }
      if (o.mitre) patch.mitreData = bumpMitre(s.mitreData, o.mitre[0], o.mitre[1])
      if (o.extra) Object.assign(patch, o.extra(s, t))
      if (o.blue) Object.assign(patch, blueAlert(s, ...o.blue))

      return {
        patch,
        // terminal: hanya satu baris per fase, ditulis oleh langkah terakhir fase
        term: o.final ? [['[+]', `${KILL_CHAIN_STEPS[PHASE_INDEX[phase]].label.toUpperCase()} → ${text}`]] : [],
        logs: [{ team: o.team ?? 'RED', prefix: o.prefix, severity: o.sev ?? 'medium', msg: text, techniqueId: o.tech }],
      }
    },
  }
}

export function redPhaseSteps(phase: KillPhase, targetId: string): OpsStep[] {
  const opts = redPhaseOpts(phase)
  return opts.map((o, i) => redStep(phase, targetId, { ...o, final: i === opts.length - 1 }))
}

function redPhaseOpts(phase: KillPhase): RedOpt[] {
  const b = (o: RedOpt) => o
  switch (phase) {
    case 'recon':
      return [
        b({ id: 'OSINT sweep', prefix: '[*]', gain: 1, tech: 'T1595', mitre: [['T1595'], 2],
            text: t => `OSINT sweep: subdomain enumeration on ${t.name}` }),
        b({ id: 'Port scan', prefix: '[+]', gain: 2, tech: 'T1046', mitre: [['T1046'], 2],
            text: t => `${randInt(12, 40)} hosts discovered · ${randInt(4, 12)} services exposed on ${t.name}` }),
        b({ id: 'Vuln mapping', prefix: '[#]', team: 'INTEL', gain: 3, tech: 'T1190',
            text: t => `Vulnerable service identified: ${pick(CVES)} on ${t.name}` }),
      ]
    case 'weaponize':
      return [
        b({ id: 'Build payload', prefix: '[*]', gain: 2, tech: 'T1587',
            text: t => `Building payload against fingerprinted stack of ${t.name}` }),
        b({ id: 'Obfuscate', prefix: '[+]', gain: 1, tech: 'T1027',
            text: () => 'Obfuscation pass complete · AV score 2/68',
            extra: s => {
              let n = 0
              return { payloads: s.payloads.map(p => (p.status === 'AVAILABLE' && n++ < 2 ? { ...p, status: 'LOADED' as const } : p)) }
            } }),
      ]
    case 'deliver':
      return [
        b({ id: 'Stage lure', prefix: '[*]', gain: 2, tech: 'T1566',
            text: t => `Staging lure for ${t.name} · watering-hole host online` }),
        b({ id: 'Lure opened', prefix: '[+]', gain: 4, tech: 'T1566', mitre: [['T1566'], 3],
            text: () => `${randInt(2, 5)} recipients opened lure · callback received`,
            extra: s => {
              let done = false
              return { payloads: s.payloads.map(p => (!done && p.status === 'LOADED' ? ((done = true), { ...p, status: 'DEPLOYED' as const }) : p)) }
            },
            blue: ['medium', 'Spear phishing delivered to {asset}', 'MAIL-3101'] }),
      ]
    case 'exploit':
      return [
        b({ id: 'Trigger vuln', prefix: '[!]', gain: 3, tech: 'T1190', sev: 'critical', mitre: [['T1190'], 3],
            text: t => `Triggering ${pick(CVES)} on ${t.name}`,
            blue: ['high', 'Exploit attempt on {asset} web portal', 'IPS-7701'] }),
        b({ id: 'Initial access', prefix: '[+]', gain: 8, tech: 'T1203', sev: 'high', mitre: [['T1203', 'T1059'], 3],
            text: t => `Initial access gained on ${t.name} · user context svc_app`,
            blue: ['critical', 'Remote code execution on {asset}', 'EDR-9001'] }),
      ]
    case 'install':
      return [
        b({ id: 'Persistence', prefix: '[*]', gain: 3, tech: 'T1053', mitre: [['T1053'], 3],
            text: t => `Writing persistence on ${t.name} (scheduled task)` }),
        b({ id: 'Implant verified', prefix: '[+]', gain: 6, tech: 'T1547', sev: 'high', mitre: [['T1547'], 3],
            text: () => 'Implant survives reboot · checksum OK',
            blue: ['high', 'Persistence mechanism created on {asset}', 'EDR-8801'] }),
      ]
    case 'c2':
      return [
        b({ id: 'Negotiate channel', prefix: '[*]', gain: 1, tech: 'T1071',
            text: t => `Negotiating covert channel to ${t.name}` }),
        b({ id: 'Beacon live', prefix: '[+]', team: 'C2', gain: 3, tech: 'T1071', sev: 'high', mitre: [['T1071', 'T1572'], 3],
            text: () => 'Beacon established · jitter 20%',
            extra: (s, t) => ({ c2Sessions: [...s.c2Sessions, newC2(t)].slice(-12) }),
            blue: ['high', 'C2 beacon outbound from {asset}', 'NET-3301'] }),
      ]
    case 'exfil':
      return [
        b({ id: 'Collect data', prefix: '[*]', gain: 3, tech: 'T1005',
            text: t => `Collecting archives from file shares of ${t.name}` }),
        b({ id: 'Exfil stream', prefix: '[+]', gain: 8, tech: 'T1041', sev: 'critical', mitre: [['T1041', 'T1567'], 4],
            text: () => 'Exfil stream opened → dropzone',
            extra: (s, t) => {
              const sets: ExfilDataset[] = [0, 1].map(() => ({
                id: uid('ds'), targetId: t.id, name: pick(DATASETS), sizeMB: randInt(30, 150), transferredMB: 0, status: 'in-progress' as const,
              }))
              return { exfilDatasets: [...s.exfilDatasets, ...sets].slice(-40) }
            },
            blue: ['critical', 'Exfil attempt — {size}MB via DNS on {asset}', 'DLP-5601'] }),
      ]
  }
}

// ============================================================
// BLUE — efek otomatis per kegiatan
// ============================================================

interface Effect {
  text:    string
  prefix?: LogPrefix
  patch?:  Partial<WarState>
}

function contain(s: WarState, n: number) {
  let count = 0
  const idAssets = s.idAssets.map(a => {
    if (a.underAttack && count < n) { count++; return { ...a, underAttack: false } }
    return a
  })
  return { idAssets, count }
}

function ackWhere(s: WarState, pred: (a: Alert) => boolean, n: number, action: AlertAction) {
  let count = 0
  const alerts = s.alerts.map(a => {
    if (!a.ack && count < n && pred(a)) { count++; return { ...a, ack: true, action } }
    return a
  })
  return { alerts, count }
}

function kill(s: WarState, pred: (c: C2Session) => boolean) {
  const c2Sessions = s.c2Sessions.filter(c => !pred(c))
  return { c2Sessions, count: s.c2Sessions.length - c2Sessions.length }
}

function haltExfil(s: WarState) {
  const exfilDatasets = s.exfilDatasets.filter(d => d.status === 'done')
  return { exfilDatasets, count: s.exfilDatasets.length - exfilDatasets.length }
}

const rule = (...p: string[]) => (a: Alert) => p.some(x => a.rule.startsWith(x))
const lowMed = (a: Alert) => a.severity === 'low' || a.severity === 'medium'

const BLUE_EFFECTS: Record<string, (s: WarState) => Effect> = {
  // ── Perencanaan ──
  'plan-asm': s => ({
    text: `${randInt(18, 32)} internet-facing assets mapped · ${randInt(2, 6)} exposed services flagged`,
    patch: { mitreData: bumpMitre(s.mitreData, ['T1595', 'T1046'], -1) },
  }),
  'plan-ti': s => ({
    text: '3 new IOCs ingested from partner feeds (BSSN · ISAC)',
    prefix: '[#]',
    patch: { iocs: [...s.iocs, newIoc(), newIoc(), newIoc()].slice(-30) },
  }),
  'plan-va': s => ({
    text: `${randInt(8, 24)} vulnerabilities prioritised · patches queued (+2% asset health)`,
    patch: { idAssets: s.idAssets.map(a => ({ ...a, healthPercent: clamp(a.healthPercent + 2) })) },
  }),

  // ── Persiapan ──
  'prep-mal':   s => ({ text: 'Sandbox detonation complete · 1 sample signature published', prefix: '[#]', patch: { iocs: [...s.iocs, newIoc('hash')].slice(-30) } }),
  'prep-email': () => ({ text: 'Mail gateway hardened · SPF/DKIM/DMARC enforced' }),
  'prep-web':   () => ({ text: 'Web filter categories updated · 38 malicious domains blocked' }),
  'prep-ips':   () => ({ text: 'Signatures updated · inline prevention enabled', patch: { idsOn: true, ipsOn: true } }),
  'prep-edr':   () => ({ text: 'EDR agents verified on 20/20 critical assets', patch: { edrOn: true } }),
  'prep-siem':  () => ({ text: 'Correlation rules loaded · log sources healthy', patch: { siemOn: true } }),

  // ── Pelaksanaan ──
  'exec-email': s => {
    const r = ackWhere(s, rule('MAIL'), 2, 'BLOCK IP')
    return {
      text: `Phishing blocked · ${r.count} mail alert(s) closed`,
      patch: { alerts: r.alerts, threatsBlocked: s.threatsBlocked + r.count + 1, mitreData: bumpMitre(s.mitreData, ['T1566'], -2) },
    }
  },
  'exec-web': s => ({
    text: 'Malicious URL categories blocked · 2 downloads stopped',
    patch: { threatsBlocked: s.threatsBlocked + 2 },
  }),
  'exec-ips': s => {
    const c = contain(s, 1)
    const r = ackWhere(s, rule('IPS', 'NET'), 2, 'BLOCK IP')
    return {
      text: `Exploit traffic dropped · ${c.count} host(s) released · ${r.count} alert(s) closed`,
      patch: { idAssets: c.idAssets, alerts: r.alerts, threatsBlocked: s.threatsBlocked + 2, mitreData: bumpMitre(s.mitreData, ['T1190'], -2) },
    }
  },
  'exec-edr': s => {
    const c = contain(s, 1)
    const r = ackWhere(s, rule('EDR'), 2, 'ISOLATE HOST')
    return {
      text: `Malicious process killed · ${c.count} host(s) isolated · ${r.count} alert(s) closed`,
      patch: { idAssets: c.idAssets, alerts: r.alerts, threatsBlocked: s.threatsBlocked + c.count, mitreData: bumpMitre(s.mitreData, ['T1203', 'T1059'], -2) },
    }
  },
  'exec-fim': s => ({
    text: 'Unauthorized file changes detected and reverted',
    patch: { mitreData: bumpMitre(s.mitreData, ['T1547', 'T1053'], -2) },
  }),
  'exec-net': s => ({
    text: 'Netflow anomaly baselined · scanning source rate-limited',
    patch: { threatsBlocked: s.threatsBlocked + 1, mitreData: bumpMitre(s.mitreData, ['T1046', 'T1595'], -2) },
  }),
  'exec-dns': s => {
    const k = kill(s, c => c.protocol === 'dns')
    return {
      text: k.count ? `DNS tunneling detected · ${k.count} C2 channel(s) sinkholed` : 'No DNS tunneling — resolver baseline healthy',
      patch: { c2Sessions: k.c2Sessions, mitreData: bumpMitre(s.mitreData, ['T1572'], -2), threatsBlocked: s.threatsBlocked + k.count },
    }
  },
  'exec-ndr': s => {
    let done = false
    const k = kill(s, () => (!done ? ((done = true), true) : false))
    return {
      text: k.count ? 'Beacon pattern matched · 1 C2 session severed' : 'No beaconing found — east-west traffic clean',
      patch: { c2Sessions: k.c2Sessions, mitreData: bumpMitre(s.mitreData, ['T1071'], -2), threatsBlocked: s.threatsBlocked + k.count },
    }
  },
  'exec-siem': s => {
    const r = ackWhere(s, lowMed, 2, 'INVESTIGATE')
    return { text: `${r.count} alert(s) correlated into incidents`, patch: { alerts: r.alerts } }
  },

  // ── Pengendalian ──
  'ctrl-siem': s => {
    const r = ackWhere(s, a => a.severity !== 'critical', 3, 'INVESTIGATE')
    return { text: `Incident queue triaged · ${r.count} alert(s) investigated`, patch: { alerts: r.alerts } }
  },
  'ctrl-edr': s => {
    const c = contain(s, 2)
    return { text: `${c.count} compromised host(s) isolated from network`, patch: { idAssets: c.idAssets, threatsBlocked: s.threatsBlocked + c.count } }
  },
  'ctrl-fw': s => {
    const k = kill(s, c => c.protocol === 'http' || c.protocol === 'tcp')
    const ioc: IOC = { ...newIoc('ip'), threat: 'SOC-BLOCKED', confidence: 95, actions: ['ADD BLOCKLIST'] }
    return {
      text: `Egress blocked · ${k.count} C2 session(s) cut · ${ioc.value} added to blocklist`,
      patch: { c2Sessions: k.c2Sessions, iocs: [...s.iocs, ioc].slice(-30), threatsBlocked: s.threatsBlocked + 3 },
    }
  },
  'ctrl-dlp': s => {
    const h = haltExfil(s)
    return {
      text: h.count ? `Data transfer halted · ${h.count} exfil stream(s) terminated` : 'No active exfiltration — DLP policies enforced',
      patch: { exfilDatasets: h.exfilDatasets, mitreData: bumpMitre(s.mitreData, ['T1041', 'T1567'], -3), threatsBlocked: s.threatsBlocked + h.count },
    }
  },
  'ctrl-dns': s => {
    const k = kill(s, c => c.protocol === 'dns' || c.protocol === 'icmp')
    return {
      text: k.count ? `Malicious domains sinkholed · ${k.count} tunnel(s) closed` : 'DNS security policy enforced · no tunnels found',
      patch: { c2Sessions: k.c2Sessions, mitreData: bumpMitre(s.mitreData, ['T1572'], -3), threatsBlocked: s.threatsBlocked + k.count },
    }
  },
  'ctrl-soar': s => {
    const r = ackWhere(s, lowMed, 10, 'MARK READ')
    return { text: `Playbook executed · ${r.count} low/medium alert(s) auto-closed`, patch: { alerts: r.alerts } }
  },
  'ctrl-ir': s => {
    const c = contain(s, 99)
    const r = ackWhere(s, a => a.severity === 'critical', 3, 'ISOLATE HOST')
    return {
      text: `IR team engaged · ${c.count} host(s) contained · ${r.count} critical alert(s) closed`,
      patch: { idAssets: c.idAssets, alerts: r.alerts, threatsBlocked: s.threatsBlocked + c.count },
    }
  },

  // ── Pencapaian ──
  'done-ma': s => ({
    text: 'Critical services verified · degraded assets stabilised (+5%)',
    patch: { idAssets: s.idAssets.map(a => (a.healthPercent < 80 ? { ...a, healthPercent: clamp(a.healthPercent + 5) } : a)) },
  }),
  'done-dp': s => {
    const h = haltExfil(s)
    return {
      text: `Data integrity verified · ${h.count} pending transfer(s) purged`,
      patch: { exfilDatasets: h.exfilDatasets },
    }
  },
  'done-rec': s => {
    const worst = [...s.idAssets].sort((a, b) => a.healthPercent - b.healthPercent)[0]
    return {
      text: `${shortName(worst.name, 30)} restored from backup (+20%)`,
      patch: { idAssets: s.idAssets.map(a => (a.id === worst.id ? { ...a, healthPercent: clamp(a.healthPercent + 20) } : a)) },
    }
  },
  'done-dv': s => {
    const flags = [s.firewallOn, s.idsOn, s.ipsOn, s.wafOn, s.edrOn, s.siemOn, s.tiOn, s.soarOn]
    const defs = flags.filter(Boolean).length
    const ops = Object.values(s.blueOps)
    const score = Math.round((defs / flags.length) * 50 + (ops.filter(Boolean).length / ops.length) * 50)
    return { text: `Defense validation score ${score}% · ${defs}/8 controls · ${ops.filter(Boolean).length}/${ops.length} activities`, prefix: '[#]' }
  },
  'done-ll': s => {
    const top = s.mitreData.reduce((m, e) => (e.intensity > m.intensity ? e : m), s.mitreData[0])
    return {
      text: `Lessons logged · most active technique ${top.techniqueId} ${top.name}`,
      prefix: '[#]',
      patch: { mitreData: s.mitreData.map(e => ({ ...e, intensity: clamp(e.intensity - 1, 0, 10) })) },
    }
  },
}

export function blueStep(act: BlueActivity): OpsStep {
  return {
    id: act.id,
    label: act.label,
    run: s => {
      const eff = BLUE_EFFECTS[act.id]?.(s) ?? { text: 'activated' }
      return {
        patch: {
          ...eff.patch,
          blueOps: { ...s.blueOps, [act.id]: true },
          blueResults: { ...s.blueResults, [act.id]: eff.text },
          actionsTaken: s.actionsTaken + 1,
        },
        out: [[eff.prefix ?? '[+]', `${act.label} → ${eff.text}`]],
        logs: [{ team: 'BLUE', prefix: eff.prefix ?? '[+]', severity: 'low', msg: `${act.label}: ${eff.text}` }],
      }
    },
  }
}
