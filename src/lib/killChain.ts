import type { KillChainStep, KillPhase } from './types'

export const KILL_CHAIN_STEPS: KillChainStep[] = [
  { phase: 'recon',     short: 'RECON',   label: 'RECONNAISSANCE',    description: 'Passive OSINT + active network scanning' },
  { phase: 'weaponize', short: 'WEAPON',  label: 'WEAPONIZATION',     description: 'Exploit development + payload crafting' },
  { phase: 'deliver',   short: 'DELIVER', label: 'DELIVERY',          description: 'Phishing, watering hole, supply chain' },
  { phase: 'exploit',   short: 'EXPLOIT', label: 'EXPLOITATION',      description: 'Trigger vulnerability, gain initial access' },
  { phase: 'install',   short: 'INSTALL', label: 'INSTALLATION',      description: 'Implant persistence, backdoor deployment' },
  { phase: 'c2',        short: 'C2',      label: 'COMMAND & CONTROL', description: 'Establish C2 channel, maintain access' },
  { phase: 'exfil',     short: 'ACTIONS', label: 'ACTIONS ON OBJECTIVES', description: 'Data collection + exfil over covert channel' },
]

export const PHASE_INDEX: Record<KillPhase, number> = Object.fromEntries(
  KILL_CHAIN_STEPS.map((s, i) => [s.phase, i]),
) as Record<KillPhase, number>

/** Output pseudo-terminal (simulasi, teks saja) per fase. */
export const PHASE_OUTPUT: Record<KillPhase, string[]> = {
  recon: [
    '[*] OSINT sweep: subdomain enumeration started',
    '[+] 23 hosts discovered · 7 services exposed',
    '[*] Running nmap -sS -T4 on perimeter range',
  ],
  weaponize: [
    '[*] Building payload against fingerprinted stack',
    '[+] Obfuscation pass complete · AV score 2/68',
  ],
  deliver: [
    '[*] Staging lure document on watering-hole host',
    '[+] 3 recipients opened lure · callback received',
  ],
  exploit: [
    '[!] Triggering vulnerability on exposed endpoint',
    '[+] Initial access gained · user context: svc_app',
  ],
  install: [
    '[*] Writing persistence (scheduled task)',
    '[+] Implant survives reboot · checksum OK',
  ],
  c2: [
    '[*] Negotiating covert channel (dns/https)',
    '[+] Beacon established · jitter 20%',
  ],
  exfil: [
    '[*] Collecting archives from file shares',
    '[+] Exfil stream opened → dropzone',
  ],
}
