'use client'

import { useState, useEffect } from 'react'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-cyan-400 mb-4">Loading...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-cyan-400 mb-8 animate-pulse">
            NEURAL TERMINAL v2.1
          </h1>
          <p className="text-xl text-green-400 mb-8">
            🚀 Successfully Deployed! 🚀
          </p>
          <div className="bg-gray-900 border border-cyan-400 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">System Status</h2>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Deployment:</span>
                <span className="text-green-400">✅ SUCCESS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Next.js:</span>
                <span className="text-green-400">✅ WORKING</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Vercel:</span>
                <span className="text-green-400">✅ ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Responsive Design:</span>
                <span className="text-green-400">✅ ACTIVE</span>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-gray-400 mb-4">
              Your Neural Terminal is now live and working!
            </p>
            <p className="text-sm text-gray-500">
              This is a test page to confirm deployment. The full AI terminal will be restored shortly.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}