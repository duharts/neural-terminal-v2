import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Neural Terminal v2.1',
  description: 'Advanced AI-powered voice terminal with cyberpunk interface',
}

export const viewport: Viewport = {
  themeColor: '#00ffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-mono bg-black text-white antialiased overflow-hidden">
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative">
          {/* Cyberpunk Grid Overlay */}
          <div className="fixed inset-0 opacity-5 pointer-events-none cyber-grid" />
          
          {/* Scan Line Effect */}
          <div 
            className="fixed top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 pointer-events-none"
            style={{ animation: 'scan-line 3s linear infinite' }}
          />
          
          {/* Main Content */}
          <div className="relative z-20">
            {children}
          </div>
          
          {/* Noise Overlay */}
          <div className="fixed inset-0 opacity-5 pointer-events-none animate-flicker bg-noise" />
        </div>
      </body>
    </html>
  )
}