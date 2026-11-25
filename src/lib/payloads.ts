import type { PayloadState } from './types'

/** 9 payload tiles (Implementation Plan §18), 3×3 grid. Simulasi — tidak ada kode nyata. */
export const PAYLOAD_TEMPLATES: PayloadState[] = [
  { id: 'pl-01', name: 'SQLi Injector',  type: 'web',        size: '14 KB', rating: 3, status: 'LOADED' },
  { id: 'pl-02', name: 'RCE Module',     type: 'exploit',    size: '31 KB', rating: 5, status: 'AVAILABLE' },
  { id: 'pl-03', name: 'Spear Phishing', type: 'delivery',   size: '2 KB',  rating: 4, status: 'LOADED' },
  { id: 'pl-04', name: 'RAT Dropper',    type: 'backdoor',   size: '48 KB', rating: 4, status: 'AVAILABLE' },
  { id: 'pl-05', name: 'DDoS Flood',     type: 'disruption', size: '6 KB',  rating: 2, status: 'AVAILABLE' },
  { id: 'pl-06', name: '0day Bundle',    type: 'exploit',    size: '92 KB', rating: 5, status: 'AVAILABLE' },
  { id: 'pl-07', name: 'Keylogger',      type: 'keylogger',  size: '8 KB',  rating: 3, status: 'AVAILABLE' },
  { id: 'pl-08', name: 'Ransomware',     type: 'ransomware', size: '45 KB', rating: 5, status: 'AVAILABLE' },
  { id: 'pl-09', name: 'Backdoor.py',    type: 'backdoor',   size: '12 KB', rating: 4, status: 'LOADED' },
]
