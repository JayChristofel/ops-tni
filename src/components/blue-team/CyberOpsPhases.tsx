'use client'
import { useEffect, useRef } from 'react'
import { useWarStore } from '@/store/warStore'
import { Panel } from '@/components/layout/Panel'
import { OPS_STAGES, STAGE_INDEX, stageOfPhase } from '@/lib/cyberOps'
import { KILL_CHAIN_STEPS, PHASE_INDEX } from '@/lib/killChain'
import { PREFIX_COLOR, formatClock } from '@/lib/utils'

/**
 * Tahapan Operasi Siber (Blue). Klik tahap → seluruh kegiatan di tahap itu berjalan
 * otomatis, satu per satu, dengan efek nyata pada simulasi. Klik kegiatan: jalankan
 * sendiri (jika mati) atau nonaktifkan (jika aktif).
 */
export function CyberOpsPhases({ className = '' }: { className?: string }) {
  const blueStage = useWarStore(s => s.blueStage)
  const blueOps = useWarStore(s => s.blueOps)
  const blueRun = useWarStore(s => s.blueRun)
  const runBlueStage = useWarStore(s => s.runBlueStage)
  const runBlueActivity = useWarStore(s => s.runBlueActivity)
  const toggleBlueOp = useWarStore(s => s.toggleBlueOp)
  const redPhase = useWarStore(s => s.activePhase)
  const blueConsole = useWarStore(s => s.blueConsole)
  const blueResults = useWarStore(s => s.blueResults)
  const clearBlueConsole = useWarStore(s => s.clearBlueConsole)
  const consoleRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = consoleRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [blueConsole])

  const redStage = stageOfPhase(redPhase)
  const stage = OPS_STAGES[STAGE_INDEX[blueStage]]
  const allActive = OPS_STAGES.flatMap(s => s.blue).filter(a => blueOps[a.id]).length
  const allTotal = OPS_STAGES.reduce((n, s) => n + s.blue.length, 0)
  const busy = !!blueRun

  return (
    <Panel
      title="Tahapan Operasi Siber · Blue"
      tone="signal"
      right={
        blueRun
          ? <span className="text-signal animate-pulse">▶ MENJALANKAN ({blueRun.done}/{blueRun.total})</span>
          : <span className="text-signal">{allActive}/{allTotal} KEGIATAN AKTIF · klik tahap → semua kegiatan berjalan</span>
      }
      className={className}
    >
      <div className="flex flex-col">
        <div className="grid grid-cols-5 gap-1.5 px-3 pt-3">
          {OPS_STAGES.map((s, i) => {
            const active = s.blue.filter(a => blueOps[a.id]).length
            const pct = Math.round((active / s.blue.length) * 100)
            const on = s.id === blueStage
            const running = blueRun?.stage === s.id
            const redHere = s.id === redStage
            return (
              <button
                key={s.id}
                onClick={() => runBlueStage(s.id)}
                disabled={busy}
                title={`Jalankan ${s.label}: ${s.desc}`}
                className={`relative overflow-hidden flex flex-col gap-1 px-2 py-1.5 rounded-btn border text-left transition-colors disabled:cursor-not-allowed ${
                  running
                    ? 'border-signal bg-signal/20 shadow-[0_0_18px_-3px_var(--color-signal)]'
                    : on ? 'border-signal/70 bg-signal/10' : 'border-line bg-ink/40 hover:border-signal/30'
                } ${busy && !running ? 'opacity-60' : ''}`}
              >
                <span className={`flex items-center gap-1 font-mono text-[11px] font-bold ${on ? 'text-signal' : 'text-txt'}`}>
                  <span className={running ? 'animate-pulse' : ''}>{running ? '▶' : '▷'}</span>
                  {i + 1}. {s.label}
                </span>
                <span className="flex items-center gap-2 font-mono text-[10px]">
                  <span className={pct >= 70 ? 'text-signal' : pct >= 40 ? 'text-warn' : 'text-danger'}>{pct}%</span>
                  <span className="text-muted">{active}/{s.blue.length}</span>
                  {redHere && <span className="ml-auto text-danger animate-pulse" title="Fase Red saat ini">▲ RED</span>}
                </span>
                <span className="h-1 bg-line rounded-full overflow-hidden">
                  <span
                    className={`block h-full rounded-full transition-all duration-500 ${pct >= 70 ? 'bg-signal' : pct >= 40 ? 'bg-warn' : 'bg-danger'}`}
                    style={{ width: `${pct}%` }}
                  />
                </span>
                {running && (
                  <span className="absolute left-0 bottom-0 h-0.5 bg-signal transition-all duration-700" style={{ width: `${(blueRun.done / blueRun.total) * 100}%` }} />
                )}
              </button>
            )
          })}
        </div>

        <div className="px-4 pt-2 pb-1 font-mono text-[10px] text-muted">
          {stage.desc}
          <span className="ml-2">· lawan Red:</span>{' '}
          {stage.redPhases.map(p => (
            <span key={p} className="mr-1 px-1 rounded-badge border border-danger/30 text-danger">
              {KILL_CHAIN_STEPS[PHASE_INDEX[p]].short}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-2 px-3 pb-3">
          {/* Kegiatan: status + hasil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1.5 content-start">
            {stage.blue.map(a => {
              const on = !!blueOps[a.id]
              const st = blueRun?.stage === blueStage ? blueRun.status?.[a.id] : undefined
              const running = st === 'running'
              const result = blueResults[a.id]
              return (
                <button
                  key={a.id}
                  onClick={() => (on ? toggleBlueOp(a.id) : runBlueActivity(a.id))}
                  disabled={busy}
                  title={result ? `${a.label}: ${result}` : on ? 'Aktif — klik untuk menonaktifkan' : 'Nonaktif — klik untuk menjalankan'}
                  className={`flex flex-col gap-1 px-2.5 py-1.5 rounded-btn border font-mono text-left transition-all disabled:cursor-not-allowed ${
                    running
                      ? 'border-signal bg-signal/20 shadow-[0_0_16px_-3px_var(--color-signal)]'
                      : on
                      ? 'border-signal/50 bg-signal/10'
                      : 'border-line bg-ink/40 hover:border-signal/30'
                  }`}
                >
                  <span className={`flex items-center gap-1.5 text-[11px] ${on || running ? 'text-signal' : 'text-muted'}`}>
                    <span className={running ? 'animate-spin inline-block' : ''}>{running ? '◌' : on ? '●' : '○'}</span>
                    <span className="truncate font-semibold">{a.label}</span>
                    <span className={`ml-auto shrink-0 text-[9px] px-1 rounded-badge border ${
                      running ? 'border-signal text-signal animate-pulse'
                      : st === 'done' ? 'border-signal/50 text-signal'
                      : on ? 'border-signal/30 text-signal/80' : 'border-line text-muted'
                    }`}>
                      {running ? 'JALAN' : st === 'done' ? 'SELESAI' : on ? 'AKTIF' : 'OFF'}
                    </span>
                  </span>
                  <span className={`text-[10px] leading-snug line-clamp-2 ${result ? 'text-txt/80' : 'text-muted/60'}`}>
                    {running ? 'memproses…' : result ? `→ ${result}` : 'belum dijalankan'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Console output Blue */}
          <div className="flex flex-col rounded-btn border border-line bg-ink min-h-[200px] max-h-[260px]">
            <div className="flex items-center justify-between px-2.5 py-1 border-b border-line font-mono text-[10px] text-muted">
              <span><span className="text-signal">◉</span> SOC CONSOLE · OUTPUT</span>
              <button onClick={clearBlueConsole} className="px-1.5 rounded-badge border border-line hover:text-txt">[CLEAR]</button>
            </div>
            <div ref={consoleRef} className="flex-1 overflow-y-auto p-2.5 font-mono text-[10.5px] leading-relaxed">
              {blueConsole.map(l => (
                <div key={l.id} className="whitespace-pre-wrap break-words">
                  <span className="text-muted/60">{l.ts ? formatClock(l.ts) : '--:--:--'} </span>
                  {l.prefix && <span className={PREFIX_COLOR[l.prefix]}>{l.prefix} </span>}
                  <span className={l.prefix === '[>]' ? 'text-signal' : 'text-txt'}>
                    {l.prefix === '[>]' && <span className="text-muted">analyst@soc:~# </span>}
                    {l.text}
                  </span>
                </div>
              ))}
              <div>
                <span className="text-muted">analyst@soc:~# </span>
                <span className="inline-block w-2 h-3 align-middle bg-signal animate-blink" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
