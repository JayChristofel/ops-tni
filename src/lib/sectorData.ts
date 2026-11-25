import type { GeoCoord, IDAsset, SGTarget, SectorId } from './types'

// ============================================================
// 6 Singapore Targets
// ============================================================

export const SG_TARGETS_MASTER: { id: string; name: string; sector: SectorId; geoCoord: GeoCoord }[] = [
  { id: 'sg-01', name: 'CAAS – Changi ATC',             sector: 'transport',  geoCoord: { lat: 1.3644, lng: 103.9915 } },
  { id: 'sg-02', name: 'MAS – Pusat Kliring FAST',      sector: 'finance',    geoCoord: { lat: 1.2837, lng: 103.8607 } },
  { id: 'sg-03', name: 'EMA – Smart Grid Control',      sector: 'energy',     geoCoord: { lat: 1.3521, lng: 103.8198 } },
  { id: 'sg-04', name: 'MINDEF – C2 Node Barat',        sector: 'military',   geoCoord: { lat: 1.3416, lng: 103.7033 } },
  { id: 'sg-05', name: 'GovTech – Pusat Data Nasional', sector: 'government', geoCoord: { lat: 1.3214, lng: 103.8558 } },
  { id: 'sg-06', name: 'Singtel – NOC Utama',           sector: 'telco',      geoCoord: { lat: 1.2905, lng: 103.7916 } },
]

export const SG_TARGETS: SGTarget[] = SG_TARGETS_MASTER.map(t => ({
  ...t,
  compromisePercent: 0,
  underAttack:       false,
  c2Sessions:        0,
  dataExfil:         0,
  status:            'secure',
  killPhase:         'recon',
}))

// ============================================================
// 8 Defense Sectors + Cluster Positions
// ============================================================

export const SECTOR_ORDER: SectorId[] = [
  'energy', 'transport', 'cctv', 'finance', 'government', 'military', 'health', 'telco',
]

export const SECTOR_META: Record<SectorId, {
  label: string
  short: string
  icon:  string
  clusterPos: { x: number; y: number; z: number }
}> = {
  energy:     { label: 'ENERGI',       short: 'ENRG',  icon: '⚡', clusterPos: { x: 0,     y: 0, z: -2.5  } },
  transport:  { label: 'TRANSPORTASI', short: 'TRANS', icon: '🚆', clusterPos: { x: 1.77,  y: 0, z: -1.77 } },
  cctv:       { label: 'CCTV',         short: 'CCTV',  icon: '📹', clusterPos: { x: 2.5,   y: 0, z:  0    } },
  finance:    { label: 'KEUANGAN',     short: 'UANG',  icon: '💰', clusterPos: { x: 1.77,  y: 0, z:  1.77 } },
  government: { label: 'PEMERINTAH',   short: 'GOV',   icon: '🏛️', clusterPos: { x: 0,     y: 0, z:  2.5  } },
  military:   { label: 'MILITER',      short: 'MIL',   icon: '⚔️', clusterPos: { x: -1.77, y: 0, z:  1.77 } },
  health:     { label: 'KESEHATAN',    short: 'HLTH',  icon: '🏥', clusterPos: { x: -2.5,  y: 0, z:  0    } },
  telco:      { label: 'TELKO',        short: 'TELKO', icon: '📡', clusterPos: { x: -1.77, y: 0, z: -1.77 } },
}

export const SECTORS = SECTOR_ORDER.map(id => ({ id, ...SECTOR_META[id] }))

// ============================================================
// 20 Indonesia Assets
// ============================================================

export const ID_ASSETS_MASTER: { id: string; name: string; sectorId: SectorId; geoCoord: GeoCoord }[] = [
  // ⚡ ENERGY
  { id: 'id-01', name: 'PLN – Grid Kontrol Jawa',                 sectorId: 'energy',     geoCoord: { lat: -6.2,   lng: 106.8   } },
  { id: 'id-02', name: 'Pertamina – SCADA Pipeline Sumatra',      sectorId: 'energy',     geoCoord: { lat: -1.0,   lng: 101.5   } },
  { id: 'id-03', name: 'PLN – Pusat Distribusi Sulawesi',         sectorId: 'energy',     geoCoord: { lat: -1.5,   lng: 124.9   } },
  // 🚆 TRANSPORTASI
  { id: 'id-04', name: 'Kemenhub – ATC Soekarno-Hatta',           sectorId: 'transport',  geoCoord: { lat: -6.127, lng: 106.656 } },
  { id: 'id-05', name: 'Pelindo – Sistem Pelabuhan Tanjung Priok',sectorId: 'transport',  geoCoord: { lat: -6.1,   lng: 106.88  } },
  { id: 'id-06', name: 'KAI – Pusat Kendali Kereta Nasional',     sectorId: 'transport',  geoCoord: { lat: -6.9,   lng: 107.6   } },
  // 📹 CCTV
  { id: 'id-07', name: 'Polri – Pusat Pemantauan CCTV Jakarta',   sectorId: 'cctv',       geoCoord: { lat: -6.21,  lng: 106.845 } },
  { id: 'id-08', name: 'Dishub DKI – Command Center ATCS',        sectorId: 'cctv',       geoCoord: { lat: -6.185, lng: 106.835 } },
  // 💰 KEUANGAN
  { id: 'id-09', name: 'BI – Sistem BI-FAST',                     sectorId: 'finance',    geoCoord: { lat: -6.185, lng: 106.812 } },
  { id: 'id-10', name: 'BRI – Core Banking System',               sectorId: 'finance',    geoCoord: { lat: -6.21,  lng: 106.831 } },
  { id: 'id-11', name: 'OJK – Pusat Pengawasan Pasar Modal',      sectorId: 'finance',    geoCoord: { lat: -6.225, lng: 106.825 } },
  // 🏛️ PEMERINTAH
  { id: 'id-12', name: 'BSSN – Pusat Operasi Siber Nasional',     sectorId: 'government', geoCoord: { lat: -6.235, lng: 106.845 } },
  { id: 'id-13', name: 'Kominfo – NOC PDN',                       sectorId: 'government', geoCoord: { lat: -6.19,  lng: 106.82  } },
  // ⚔️ MILITER
  { id: 'id-14', name: 'Mabes TNI – Sistem C2 Terpadu',           sectorId: 'military',   geoCoord: { lat: -6.26,  lng: 106.78  } },
  { id: 'id-15', name: 'Kogabwilhan I – Node Siber Barat',        sectorId: 'military',   geoCoord: { lat: -6.23,  lng: 106.75  } },
  // 🏥 KESEHATAN
  { id: 'id-16', name: 'Kemenkes – Sistem Informasi Kesehatan Nasional', sectorId: 'health', geoCoord: { lat: -6.185, lng: 106.853 } },
  { id: 'id-17', name: 'BPJS – Database Kepesertaan',             sectorId: 'health',     geoCoord: { lat: -6.21,  lng: 106.861 } },
  // 📡 TELKO
  { id: 'id-18', name: 'Telkom – NOC Palapa Ring',                sectorId: 'telco',      geoCoord: { lat: -6.175, lng: 106.783 } },
  { id: 'id-19', name: 'Indosat – Pusat Kendali Jaringan',        sectorId: 'telco',      geoCoord: { lat: -6.198, lng: 106.795 } },
  { id: 'id-20', name: 'XL Axiata – Core Network Jakarta',        sectorId: 'telco',      geoCoord: { lat: -6.213, lng: 106.818 } },
]

export const ID_ASSETS: IDAsset[] = ID_ASSETS_MASTER.map(a => ({
  ...a,
  healthPercent: 100,
  underAttack:   false,
  status:        'secure',
  defenseActive: false,
  lastIncident:  null,
}))

/** Short display name: "PLN – Grid Kontrol Jawa" → "PLN Grid Kontrol Jawa" trimmed. */
export function shortName(name: string, max = 22): string {
  const s = name.replace(' – ', ' ')
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}
