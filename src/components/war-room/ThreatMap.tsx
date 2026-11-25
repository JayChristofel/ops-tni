'use client'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import L, { type LatLngTuple } from 'leaflet'
import { useWarStore, type WarState } from '@/store/warStore'
import { shortName } from '@/lib/sectorData'

/** Area Indonesia – Singapura. */
const BOUNDS: [LatLngTuple, LatLngTuple] = [[-10.5, 95], [6, 141]]
const JAKARTA: LatLngTuple = [-6.2, 106.8]
/** Titik asal serangan di sekitar Jakarta. */
const ORIGINS: LatLngTuple[] = [[-6.2, 106.8], [-6.9, 107.6], [-5.6, 105.9], [-7.0, 106.3], [-5.9, 107.4]]

const RED = '#FF6B6B'
const GREEN = '#3DDC97'
const AMBER = '#F2B84B'
const PURPLE = '#B79CFF'

const healthColor = (pct: number) => (pct > 60 ? GREEN : pct > 30 ? AMBER : RED)
const compromiseColor = (c: number) => (c >= 75 ? RED : c >= 40 ? AMBER : PURPLE)

/** Jalur melengkung (kurva Bezier kuadrat) antara dua titik. */
function arc(a: LatLngTuple, b: LatLngTuple, bend: number, n = 32): LatLngTuple[] {
  const [lat1, lng1] = a
  const [lat2, lng2] = b
  const mLat = (lat1 + lat2) / 2 - (lng2 - lng1) * bend
  const mLng = (lng1 + lng2) / 2 + (lat2 - lat1) * bend
  const pts: LatLngTuple[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const u = 1 - t
    pts.push([u * u * lat1 + 2 * u * t * mLat + t * t * lat2, u * u * lng1 + 2 * u * t * mLng + t * t * lng2])
  }
  return pts
}

/** Label teks di peta (style inline agar tidak bergantung pada CSS global). */
const label = (text: string, color: string, transform: string) =>
  L.divIcon({
    className: 'map-label',
    iconSize: [0, 0],
    html: `<div style="width:max-content;white-space:nowrap;font:600 10px/1 ui-monospace,monospace;letter-spacing:.05em;
      padding:4px 7px;border-radius:4px;background:rgba(7,9,11,.88);color:${color};border:1px solid ${color}80;
      transform:${transform}">${text}</div>`,
  })

const toggleClass = (layer: L.Path, cls: string, on: boolean) => {
  const el = layer.getElement()
  if (el) cls.split(' ').forEach(c => el.classList.toggle(c, on))
}

/**
 * Peta ancaman Leaflet. Dibuat & dihancurkan di dalam satu effect, sehingga aman
 * saat route disembunyikan/ditampilkan lagi oleh <Activity> (cacheComponents).
 */
export default function ThreatMap() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const map = L.map(el, {
      zoomControl: false,
      minZoom: 4,
      maxZoom: 12,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      maxBounds: [[-25, 80], [20, 155]],
    })
    map.fitBounds(BOUNDS)

    // Esri World Dark Gray — gratis, tanpa API key
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
      maxNativeZoom: 16,
    }).addTo(map)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxNativeZoom: 16,
    }).addTo(map)

    const init = useWarStore.getState()

    // ── Jalur ID → SG (serangan Red), satu per target
    const outLines = init.sgTargets.map((t, i) =>
      L.polyline(arc(ORIGINS[i % ORIGINS.length], [t.geoCoord.lat, t.geoCoord.lng], 0.22), { color: RED, interactive: false }).addTo(map),
    )
    // ── Jalur SG → ID (hanya tampil saat aset diserang)
    const inLines = init.idAssets.map((a, i) => {
      const src = init.sgTargets[i % init.sgTargets.length].geoCoord
      return L.polyline(arc([src.lat, src.lng], [a.geoCoord.lat, a.geoCoord.lng], -0.18), {
        color: GREEN, weight: 1.6, opacity: 0.85, dashArray: '4 8', interactive: false,
      })
    })
    // ── Aset Indonesia
    const idMarkers = init.idAssets.map(a =>
      L.circleMarker([a.geoCoord.lat, a.geoCoord.lng], { radius: 4, fillOpacity: 0.85 })
        .bindTooltip('', { direction: 'top', className: 'map-tip' })
        .addTo(map),
    )
    // ── Target Singapura (klik = pilih target)
    const sgMarkers = init.sgTargets.map(t =>
      L.circleMarker([t.geoCoord.lat, t.geoCoord.lng], { radius: 6, fillOpacity: 0.9 })
        .bindTooltip('', { direction: 'right', className: 'map-tip' })
        .on('click', () => useWarStore.getState().selectTarget(t.id))
        .addTo(map),
    )

    L.marker(JAKARTA, { icon: label('🇮🇩 JAKARTA · CYBER OPS', GREEN, 'translate(calc(-100% - 12px), -50%)'), interactive: false }).addTo(map)
    L.marker([1.42, 103.95], { icon: label('🇸🇬 SINGAPORE · 6 TARGET', RED, 'translate(14px, -130%)'), interactive: false }).addTo(map)

    const render = (s: WarState) => {
      s.sgTargets.forEach((t, i) => {
        const line = outLines[i]
        if (line) {
          line.setStyle({
            weight: t.underAttack ? 2 : 1,
            opacity: t.underAttack ? 0.9 : 0.15,
            dashArray: t.underAttack ? '6 8' : '',
          })
          toggleClass(line, 'map-flow', t.underAttack)
        }
        const m = sgMarkers[i]
        if (!m) return
        const c = t.compromisePercent
        const sel = t.id === s.selectedTargetId
        m.setRadius(sel ? 8 : 6)
        m.setStyle({ color: sel ? RED : compromiseColor(c), fillColor: compromiseColor(c), weight: sel ? 3 : 1.5 })
        toggleClass(m, 'map-pulse', t.underAttack)
        m.setTooltipContent(
          `<b>[${t.id.toUpperCase()}] ${shortName(t.name, 28)}</b><br/>compromise ${c}% · ${t.killPhase.toUpperCase()} · C2 ${t.c2Sessions}`,
        )
      })

      s.idAssets.forEach((a, i) => {
        const line = inLines[i]
        if (line) {
          if (a.underAttack && !map.hasLayer(line)) {
            line.addTo(map)
            toggleClass(line, 'map-flow map-flow-slow', true)
          } else if (!a.underAttack && map.hasLayer(line)) {
            line.remove()
          }
        }
        const m = idMarkers[i]
        if (!m) return
        const hc = healthColor(a.healthPercent)
        m.setRadius(a.underAttack ? 6 : 4)
        m.setStyle({ color: a.underAttack ? RED : hc, fillColor: hc, weight: a.underAttack ? 2 : 1 })
        toggleClass(m, 'map-pulse', a.underAttack)
        m.setTooltipContent(
          `<b>${a.name}</b><br/>health ${a.healthPercent}% · ${a.status}${a.underAttack ? ' · UNDER ATTACK' : ''}`,
        )
      })
    }

    render(init)
    const unsub = useWarStore.subscribe(render)

    // Ukuran container bisa berubah (resize / route ditampilkan lagi)
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(el)

    return () => {
      unsub()
      ro.disconnect()
      map.remove()
    }
  }, [])

  return <div ref={ref} className="threat-map w-full h-full" style={{ background: '#07090B' }} />
}
