'use client'
import { motion } from 'framer-motion'
import { useWarStore } from '@/store/warStore'
import { KILL_CHAIN_STEPS, PHASE_INDEX } from '@/lib/killChain'
import { OPS_STAGES, STAGE_INDEX, stageOfPhase } from '@/lib/cyberOps'

/**
 * Tahapan Operasi Siber (Red). Klik tahap / fase → menjalankan fase kill chain
 * di dalamnya secara otomatis terhadap target terpilih.
 */
export function KillChain({ className = '' }: { className?: string }) {
  const activePhase = useWarStore(s => s.activePhase)
  const runRedStage = useWarStore(s => s.runRedStage)
  const redRun = useWarStore(s => s.redRun)
  const selectedId = useWarStore(s => s.selectedTargetId)
  const activeIdx = PHASE_INDEX[activePhase]
  const activeStageIdx = STAGE_INDEX[stageOfPhase(activePhase)]
  const busy = !!redRun

  return (
    <section className={`flex flex-col gap-2 bg-surface border border-line rounded-card px-4 py-2.5 overflow-x-auto ${className}`}>
      <div className="font-mono text-[10px] text-muted tracking-widest shrink-0 flex items-center gap-2">
        <span><span className="text-danger">◉</span> TAHAPAN OPERASI SIBER · RED{selectedId && <> · <span className="text-danger">{selectedId.toUpperCase()}</span></>}</span>
        <span className="hidden lg:inline text-muted/70">
          {redRun
            ? <span className="text-danger animate-pulse">▶ MENJALANKAN {redRun.current?.toUpperCase()} ({redRun.done}/{redRun.total})</span>
            : 'klik tahap untuk menjalankan otomatis'}
        </span>
      </div>

      <div className="grid gap-2 flex-1 min-w-[880px]" style={{ gridTemplateColumns: '1fr 1fr 2.6fr 1fr 1.3fr' }}>
        {OPS_STAGES.map((stage, si) => {
          const state = si < activeStageIdx ? 'done' : si === activeStageIdx ? 'active' : 'pending'
          const running = redRun?.stage === stage.id
          return (
            <div
              key={stage.id}
              className={`relative overflow-hidden flex flex-col gap-1.5 rounded-btn border px-2 py-1.5 transition-colors ${
                running
                  ? 'border-danger bg-danger/15 shadow-[0_0_18px_-3px_var(--color-danger)]'
                  : state === 'active'
                  ? 'border-danger/60 bg-danger/10'
                  : state === 'done'
                  ? 'border-signal/30 bg-signal/5'
                  : 'border-line bg-ink/40'
              }`}
            >
              <button
                onClick={() => runRedStage(stage.id)}
                disabled={!selectedId || busy}
                title={`Jalankan ${stage.label}: ${stage.desc}`}
                className={`flex items-center gap-1.5 font-mono text-[11px] font-bold text-left hover:brightness-125 disabled:cursor-not-allowed ${
                  state === 'active' ? 'text-danger' : state === 'done' ? 'text-signal/80' : 'text-muted'
                } ${!selectedId || busy ? 'opacity-60' : ''}`}
              >
                <span className={state === 'active' || running ? 'animate-pulse' : ''}>
                  {running ? '▶' : state === 'done' ? '✓' : state === 'active' ? '●' : '○'}
                </span>
                {si + 1}. {stage.label}
                {running && <span className="ml-auto text-[9px] font-normal">{redRun.done}/{redRun.total}</span>}
              </button>
              <div className="flex flex-wrap gap-1">
                {stage.redPhases.map(ph => {
                  const step = KILL_CHAIN_STEPS[PHASE_INDEX[ph]]
                  const idx = PHASE_INDEX[ph]
                  const pstate = idx < activeIdx ? 'done' : idx === activeIdx ? 'active' : 'pending'
                  return (
                    <motion.button
                      layout
                      key={ph}
                      onClick={() => runRedStage(stage.id, ph)}
                      disabled={!selectedId || busy}
                      title={`Jalankan ${step.label} — ${step.description}`}
                      className={`px-2 py-0.5 rounded-badge border font-mono text-[10px] font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        pstate === 'done'
                          ? 'text-signal/80 bg-signal/10 border-signal/30 hover:bg-signal/20'
                          : pstate === 'active'
                          ? 'text-danger bg-danger/20 border-danger/60'
                          : 'text-muted bg-line/60 border-line hover:text-txt'
                      }`}
                    >
                      {pstate === 'done' ? '✓ ' : pstate === 'active' ? '● ' : '○ '}{step.short}
                    </motion.button>
                  )
                })}
              </div>
              {running && (
                <div className="absolute left-0 bottom-0 h-0.5 bg-danger transition-all duration-700" style={{ width: `${(redRun.done / redRun.total) * 100}%` }} />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
