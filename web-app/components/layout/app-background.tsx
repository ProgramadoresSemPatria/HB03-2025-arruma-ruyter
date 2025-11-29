'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

type AppBackgroundProps = {
  children: ReactNode
}

export function AppBackground({ children }: AppBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-purple-600/25 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(147,51,234,0.16),transparent_55%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-size-[40px_40px] opacity-40" />

        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/3 h-64 bg-linear-to-r from-indigo-500/10 via-purple-500/8 to-transparent blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}


