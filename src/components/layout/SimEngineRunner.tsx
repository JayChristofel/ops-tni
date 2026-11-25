'use client'
import { useEffect } from 'react'
import { useWarStore } from '@/store/warStore'
import { startSimEngine } from '@/lib/simEngine'

/**
 * Menjalankan SimEngine SEKALI untuk seluruh aplikasi.
 * Dipasang di root layout (bukan di halaman War Room) karena dengan `cacheComponents`
 * Next.js menyembunyikan route lama via <Activity> dan membersihkan effect-nya —
 * kalau engine ada di war-room/page.tsx, simulasi akan berhenti saat pindah ke Red/Blue Team.
 */
export function SimEngineRunner() {
  const doTick = useWarStore(s => s.doTick)
  useEffect(() => startSimEngine(doTick), [doTick])
  return null
}
