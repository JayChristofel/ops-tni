import type { Metadata } from 'next'
import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { ScanlineOverlay } from '@/components/layout/ScanlineOverlay'
import { ToastContainer } from '@/components/layout/ToastContainer'
import { SimEngineRunner } from '@/components/layout/SimEngineRunner'
import '@/styles/globals.css'

const jetbrains = JetBrains_Mono({ variable: '--font-jetbrains', subsets: ['latin'] })
const plex = IBM_Plex_Sans({ variable: '--font-plex', subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'CyberWar.Sim',
  description: 'Indonesia vs Singapore Cyber War Simulation — Operasi Latihan Kogabwilhan I',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={`${jetbrains.variable} ${plex.variable} bg-ink antialiased`}>
      <body className="font-mono text-txt min-h-screen">
        <SimEngineRunner />
        <ScanlineOverlay />
        <Navbar />
        {/* overflow-anchor:none — cegah browser menggeser scroll saat tinggi kartu berubah */}
        <main className="h-[calc(100vh-56px)] overflow-auto [overflow-anchor:none]">
          {children}
        </main>
        <ToastContainer />
      </body>
    </html>
  )
}
