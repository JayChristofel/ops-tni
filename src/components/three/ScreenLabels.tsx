'use client'
import { useState, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Label DOM untuk scene R3F tanpa drei <Html>.
 *
 * drei <Html> membuat React root terpisah per label. Dengan `cacheComponents`, Next.js
 * menyembunyikan route lama lewat <Activity> (cleanup + re-run effects) dan root-root itu
 * ter-unmount saat React sedang render → "removeChild ... not a child of this node".
 *
 * Di sini label dirender oleh React biasa sebagai overlay di atas canvas, dan
 * <LabelProjector> (di dalam canvas) hanya meng-update style.transform tiap frame.
 */
export interface LabelRegistry {
  objs: Map<string, THREE.Object3D>
  els:  Map<string, HTMLElement>
}

export function useLabelRegistry(): LabelRegistry {
  const [reg] = useState<LabelRegistry>(() => ({ objs: new Map(), els: new Map() }))
  return reg
}

/** Titik jangkar 3D (di dalam Canvas). */
export function LabelAnchor({ id, registry, position = [0, 0, 0] }: {
  id: string
  registry: LabelRegistry
  position?: [number, number, number] | THREE.Vector3
}) {
  return (
    <object3D
      position={position}
      ref={o => {
        if (o) registry.objs.set(id, o)
        else registry.objs.delete(id)
      }}
    />
  )
}

const _v = new THREE.Vector3()
const _n = new THREE.Vector3()
const _c = new THREE.Vector3()

/** Proyeksi semua anchor ke koordinat layar (di dalam Canvas). */
export function LabelProjector({ registry, occludeSphere }: {
  registry: LabelRegistry
  /** sembunyikan label di sisi belakang sphere yang berpusat di origin */
  occludeSphere?: boolean
}) {
  useFrame(({ camera, size }) => {
    _c.copy(camera.position).normalize()
    registry.els.forEach((el, id) => {
      const obj = registry.objs.get(id)
      if (!obj) { el.style.opacity = '0'; return }
      obj.getWorldPosition(_v)
      const facing = occludeSphere ? _n.copy(_v).normalize().dot(_c) : 1
      _v.project(camera)
      const inFront = _v.z < 1 && facing > 0.05
      const x = ((_v.x + 1) / 2) * size.width
      const y = ((1 - _v.y) / 2) * size.height
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      el.style.opacity = inFront ? String(Math.min(1, facing * 4)) : '0'
    })
  })
  return null
}

/** Overlay label (di luar Canvas, sibling-nya). */
export function LabelLayer({ registry, labels }: {
  registry: LabelRegistry
  labels: { id: string; content: ReactNode }[]
}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {labels.map(l => (
        <div
          key={l.id}
          ref={el => {
            if (el) registry.els.set(l.id, el)
            else registry.els.delete(l.id)
          }}
          className="absolute left-0 top-0 will-change-transform transition-opacity duration-200"
          style={{ opacity: 0 }}
        >
          {l.content}
        </div>
      ))}
    </div>
  )
}
