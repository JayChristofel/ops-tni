'use client'
import dynamic from 'next/dynamic'
import { AlertFeed } from '@/components/blue-team/AlertFeed'
import { SectorDefensePanel } from '@/components/blue-team/SectorDefensePanel'
import { AssetHealthBySektor } from '@/components/blue-team/AssetHealthBySektor'
import { CyberOpsPhases } from '@/components/blue-team/CyberOpsPhases'
import { MitreHeatmap } from '@/components/blue-team/MitreHeatmap'
import { IncidentResponse } from '@/components/blue-team/IncidentResponse'
import { FirewallStatus } from '@/components/blue-team/FirewallStatus'
import { ThreatIntelFeed } from '@/components/blue-team/ThreatIntelFeed'
import { CanvasPlaceholder } from '@/components/three/CanvasPlaceholder'
import { useWarStore } from '@/store/warStore'
import { SECTOR_META } from '@/lib/sectorData'

const NetworkGraph = dynamic(() => import('@/components/three/NetworkGraph3D'), {
  ssr: false,
  loading: () => <CanvasPlaceholder label="MAPPING NATIONAL NETWORK..." />,
})

function GraphFrame() {
  const filter = useWarStore(s => s.activeSectorFilter)
  return (
    <div className="area-graph relative min-h-0 bg-surface/40 border border-line rounded-card overflow-hidden">
      <NetworkGraph />
      <div className="absolute top-3 left-4 font-mono text-[10px] text-muted tracking-widest pointer-events-none">
        ◉ NATIONAL NETWORK · 8 SECTORS · 20 ASSETS
        {filter && <span className="text-signal"> · FILTER {SECTOR_META[filter].label}</span>}
      </div>
      <div className="absolute bottom-3 left-4 flex gap-3 font-mono text-[10px] text-muted pointer-events-none">
        <span><span className="text-signal">●</span> secure</span>
        <span><span className="text-warn">●</span> warn</span>
        <span><span className="text-danger">●</span> critical</span>
        <span><span className="text-danger">◌</span> under attack</span>
        <span><span className="text-signal">◯</span> shielded</span>
      </div>
    </div>
  )
}

export default function BlueTeamPage() {
  return (
    <div className="layout-blue">
      <AlertFeed className="area-alerts" />
      <GraphFrame />
      <SectorDefensePanel className="area-sectors" />
      <CyberOpsPhases className="area-ops" />
      <AssetHealthBySektor className="area-health" />
      <MitreHeatmap className="area-mitre" />
      <IncidentResponse className="area-ir" />
      <FirewallStatus className="area-fw" />
      <ThreatIntelFeed className="area-intel" />
    </div>
  )
}
