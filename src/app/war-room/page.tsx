'use client'
import dynamic from 'next/dynamic'
import { AttackFeed } from '@/components/war-room/AttackFeed'
import { WarScoreBoard } from '@/components/war-room/WarScoreBoard'
import { ThreatLevelGauge } from '@/components/war-room/ThreatLevelGauge'
import { ActiveOpsSummary } from '@/components/war-room/ActiveOpsSummary'
import { CanvasPlaceholder } from '@/components/three/CanvasPlaceholder'

// Leaflet butuh window → dynamic import ssr:false
const ThreatMap = dynamic(() => import('@/components/war-room/ThreatMap'), {
  ssr: false,
  loading: () => <CanvasPlaceholder label="INITIALIZING THREAT MAP..." />,
})

export default function WarRoomPage() {
  return (
    <div className="layout-war">
      <AttackFeed className="area-feed" />
      <div className="area-globe relative min-h-0 bg-surface/40 border border-line rounded-card overflow-hidden">
        <ThreatMap />
        <div className="absolute top-3 left-4 z-[500] px-2 py-1 rounded-badge bg-ink/80 font-mono text-[10px] text-muted tracking-widest pointer-events-none">
          ◉ THREAT MAP · INDONESIA – SINGAPURA · <span className="text-danger">━ ID→SG</span> · <span className="text-signal">━ SG→ID</span>
        </div>
        <div className="absolute bottom-3 left-4 z-[500] flex gap-3 px-2 py-1 rounded-badge bg-ink/80 font-mono text-[10px] text-muted pointer-events-none">
          <span><span className="text-purple">●</span> target SG</span>
          <span><span className="text-signal">●</span> aset ID sehat</span>
          <span><span className="text-warn">●</span> degraded</span>
          <span><span className="text-danger">◌</span> diserang</span>
        </div>
      </div>
      <WarScoreBoard className="area-score" />
      <ThreatLevelGauge className="area-gauge" />
      <ActiveOpsSummary className="area-summary" />
    </div>
  )
}
