'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWarStore } from '@/store/warStore'
import { formatTime, getThreatLabel } from '@/lib/utils'

const LINKS = [
  { href: '/war-room',  label: 'WAR ROOM',  short: 'WR', activeClass: 'text-txt border-txt' },
  { href: '/red-team',  label: 'RED TEAM',  short: 'RT', activeClass: 'text-danger border-danger' },
  { href: '/blue-team', label: 'BLUE TEAM', short: 'BT', activeClass: 'text-signal border-signal' },
] as const

export function Navbar() {
  const pathname = usePathname()
  const tick = useWarStore(s => s.tick)
  const threatLevel = useWarStore(s => s.threatLevel)
  const conflictSeconds = useWarStore(s => s.conflictSeconds)
  const paused = useWarStore(s => s.paused)
  const togglePause = useWarStore(s => s.togglePause)

  return (
    <nav className="sticky top-0 z-50 flex items-center h-14 bg-surface/90 backdrop-blur-sm border-b border-line px-4 font-mono text-sm">
      <span className="text-danger font-bold mr-6 xl:mr-8 tracking-widest whitespace-nowrap">⬡ CYBERWAR.SIM</span>

      <div className="flex items-center gap-1 xl:gap-3">
        {LINKS.map(l => {
          const active = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-2 py-4 border-b-2 transition-colors duration-150 whitespace-nowrap ${
                active ? l.activeClass : 'border-transparent text-muted hover:text-txt'
              }`}
            >
              <span className="hidden xl:inline">[ {l.label} ]</span>
              <span className="xl:hidden" title={l.label}>[{l.short}]</span>
            </Link>
          )
        })}
      </div>

      <div className="ml-auto flex items-center gap-4 xl:gap-6 text-xs text-muted">
        <span title="Conflict elapsed">T+{formatTime(conflictSeconds)}</span>
        <span className={threatLevel >= 4 ? 'text-danger' : threatLevel >= 3 ? 'text-warn' : 'text-signal'}>
          THREAT: {getThreatLabel(threatLevel)}
        </span>
        <span className="hidden lg:inline">TICK #{tick.toString().padStart(4, '0')}</span>
        <button
          onClick={togglePause}
          className={`px-2 py-0.5 rounded-badge border transition-colors ${
            paused
              ? 'text-muted border-line hover:text-txt'
              : 'text-warn border-warn/40 bg-warn/10 hover:bg-warn/20'
          }`}
          title={paused ? 'Resume simulation' : 'Pause simulation'}
        >
          {paused ? '[SIM PAUSED ○]' : <>[SIM ACTIVE <span className="animate-pulse">●</span>]</>}
        </button>
      </div>
    </nav>
  )
}
