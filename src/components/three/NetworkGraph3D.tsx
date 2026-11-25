'use client'
import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useWarStore } from '@/store/warStore'
import { SECTOR_META, SECTOR_ORDER } from '@/lib/sectorData'
import { LabelAnchor, LabelLayer, LabelProjector, useLabelRegistry, type LabelRegistry } from './ScreenLabels'
import type { AssetStatus, IDAsset, Sector, SectorId } from '@/lib/types'

const SG_SOURCE: [number, number, number] = [5, 0, 0]

const NODE_COLOR: Record<AssetStatus, { color: string; opacity: number }> = {
  secure:      { color: '#3DDC97', opacity: 1 },
  ok:          { color: '#3DDC97', opacity: 0.55 },
  warn:        { color: '#F2B84B', opacity: 1 },
  critical:    { color: '#FF6B6B', opacity: 1 },
  compromised: { color: '#FF6B6B', opacity: 1 },
}

/** Posisi node aset di sekitar cluster center (radius ~0.4). */
function nodePositions(sectorId: SectorId, count: number): [number, number, number][] {
  const { x, z } = SECTOR_META[sectorId].clusterPos
  return Array.from({ length: count }, (_, k) => {
    const ang = (2 * Math.PI * k) / count + Math.PI / 4
    const r = count === 1 ? 0 : 0.38
    return [x + Math.cos(ang) * r, 0, z + Math.sin(ang) * r]
  })
}

// ------------------------------------------------------------
// ThreatEdge — animated dashed line from SG direction
// ------------------------------------------------------------
function ThreatEdge({ to, dim }: { to: [number, number, number]; dim: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null)
  useFrame((_, dt) => {
    const mat = ref.current?.material
    if (mat) mat.dashOffset -= dt * 0.8
  })
  return (
    <Line
      ref={ref}
      points={[SG_SOURCE, [(SG_SOURCE[0] + to[0]) / 2, 0.8, (SG_SOURCE[2] + to[2]) / 2], to]}
      color="#FF6B6B"
      lineWidth={1.2}
      dashed
      dashSize={0.12}
      gapSize={0.08}
      transparent
      opacity={dim ? 0.12 : 0.7}
    />
  )
}

// ------------------------------------------------------------
// AssetNode
// ------------------------------------------------------------
function AssetNode({ asset, position, dim, registry, onHover }: {
  asset: IDAsset
  position: [number, number, number]
  dim: boolean
  registry: LabelRegistry
  onHover: (id: string | null) => void
}) {
  const ring = useRef<THREE.Mesh>(null)
  const setSectorFilter = useWarStore(s => s.setSectorFilter)
  const c = NODE_COLOR[asset.status]

  useFrame((_, dt) => { if (ring.current) ring.current.rotation.z += dt * 2.4 })

  return (
    <group position={position}>
      <LabelAnchor id={`asset-${asset.id}`} registry={registry} />
      <mesh
        onPointerOver={e => { e.stopPropagation(); onHover(asset.id); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { onHover(null); document.body.style.cursor = '' }}
        onClick={e => { e.stopPropagation(); setSectorFilter(asset.sectorId) }}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={c.color} emissive={c.color} emissiveIntensity={0.6} transparent opacity={dim ? 0.2 : c.opacity} />
      </mesh>
      {asset.underAttack && (
        <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.012, 8, 32, Math.PI * 1.6]} />
          <meshBasicMaterial color="#FF6B6B" transparent opacity={dim ? 0.2 : 0.95} />
        </mesh>
      )}
      {asset.defenseActive && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.19, 0.21, 32]} />
          <meshBasicMaterial color="#3DDC97" transparent opacity={dim ? 0.1 : 0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

// ------------------------------------------------------------
// SectorCluster
// ------------------------------------------------------------
function SectorCluster({ sector, dim, registry, onHover }: {
  sector: Sector
  dim: boolean
  registry: LabelRegistry
  onHover: (id: string | null) => void
}) {
  const { x, z } = sector.clusterPos
  const nodes = useMemo(() => nodePositions(sector.id, sector.assets.length), [sector.id, sector.assets.length])
  const critical = sector.status === 'CRITICAL'

  return (
    <group>
      <LabelAnchor id={`sector-${sector.id}`} registry={registry} position={[x, 0, z - 0.62]} />
      <mesh position={[x, 0, z]}>
        <octahedronGeometry args={[0.05]} />
        <meshBasicMaterial color={critical ? '#FF6B6B' : '#8FA39B'} transparent opacity={dim ? 0.15 : 0.8} />
      </mesh>
      {nodes.map((p, i) => (
        <Line key={i} points={[[x, 0, z], p]} color="#1F2B27" lineWidth={1} transparent opacity={dim ? 0.2 : 1} />
      ))}
      <Line points={[[0, 0, 0], [x, 0, z]]} color="#1F2B27" lineWidth={1} transparent opacity={dim ? 0.15 : 0.6} />

      {sector.assets.map((a, i) => (
        <AssetNode key={a.id} asset={a} position={nodes[i]} dim={dim} registry={registry} onHover={onHover} />
      ))}
      {sector.assets.map((a, i) => (a.underAttack ? <ThreatEdge key={`edge-${a.id}`} to={nodes[i]} dim={dim} /> : null))}
    </group>
  )
}

// ------------------------------------------------------------
// Overlay labels (DOM)
// ------------------------------------------------------------
function SectorLabel({ id }: { id: SectorId }) {
  const sector = useWarStore(s => s.sectors.find(x => x.id === id))
  const filter = useWarStore(s => s.activeSectorFilter)
  if (!sector) return null
  const dim = filter !== null && filter !== id
  const critical = sector.status === 'CRITICAL'
  return (
    <div
      className={`whitespace-nowrap font-mono text-[10px] leading-none px-1.5 py-0.5 rounded-badge border bg-ink/80 ${
        critical ? 'border-danger/60 text-danger' : filter === id ? 'border-signal/60 text-signal' : 'border-line text-txt'
      }`}
      style={{ transform: 'translate(-50%, -50%)', opacity: dim ? 0.25 : 1 }}
    >
      {sector.icon} {sector.label} <span className="text-muted">{Math.round(sector.avgHealth)}%</span>
    </div>
  )
}

function AssetTooltip({ assetId }: { assetId: string }) {
  const asset = useWarStore(s => s.idAssets.find(a => a.id === assetId))
  if (!asset) return null
  const c = NODE_COLOR[asset.status]
  return (
    <div
      className="whitespace-nowrap font-mono text-[10px] px-2 py-1 rounded-badge border border-line bg-ink/95 text-txt shadow-lg"
      style={{ transform: 'translate(-50%, calc(-100% - 16px))' }}
    >
      {asset.name}
      <span className="ml-2" style={{ color: c.color }}>{Math.round(asset.healthPercent)}%</span>
      {asset.underAttack && <span className="ml-2 text-danger">UNDER ATTACK</span>}
    </div>
  )
}

const STATIC_LABELS = [
  ...SECTOR_ORDER.map(id => ({ id: `sector-${id}`, content: <SectorLabel id={id} /> })),
  {
    id: 'sg-origin',
    content: (
      <div
        className="whitespace-nowrap font-mono text-[10px] px-1.5 py-0.5 rounded-badge border border-danger/60 text-danger bg-ink/80"
        style={{ transform: 'translate(-50%, calc(-100% - 10px))' }}
      >
        🇸🇬 SG THREAT ORIGIN
      </div>
    ),
  },
]

// ------------------------------------------------------------
// Scene
// ------------------------------------------------------------
export default function NetworkGraph3D() {
  const sectors = useWarStore(s => s.sectors)
  const filter = useWarStore(s => s.activeSectorFilter)
  const registry = useLabelRegistry()
  const [hovered, setHovered] = useState<string | null>(null)

  const labels = hovered
    ? [...STATIC_LABELS, { id: `asset-${hovered}`, content: <AssetTooltip assetId={hovered} /> }]
    : STATIC_LABELS

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0.9, 6.3, 3.1], fov: 60 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 4, 0]} intensity={0.6} />

        {/* SOC core */}
        <mesh>
          <icosahedronGeometry args={[0.14, 0]} />
          <meshBasicMaterial color="#3DDC97" wireframe />
        </mesh>
        <gridHelper args={[8, 16, '#1F2B27', '#141d1a']} position={[0, -0.12, 0]} />

        {/* SG threat origin */}
        <mesh position={SG_SOURCE}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshBasicMaterial color="#FF6B6B" />
        </mesh>
        <LabelAnchor id="sg-origin" registry={registry} position={SG_SOURCE} />

        {sectors.map(sector => (
          <SectorCluster
            key={sector.id}
            sector={sector}
            dim={filter !== null && filter !== sector.id}
            registry={registry}
            onHover={setHovered}
          />
        ))}

        <LabelProjector registry={registry} />
        <OrbitControls target={[0.9, 0, 0.25]} enableZoom enablePan autoRotate={false} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
      <LabelLayer registry={registry} labels={labels} />
    </div>
  )
}
