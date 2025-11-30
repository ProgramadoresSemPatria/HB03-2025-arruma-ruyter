'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'

export function Hero() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (isMounted) {
          setIsAuthenticated(!!user)
          setAuthChecking(false)
        }
      } catch {
        if (isMounted) {
          setAuthChecking(false)
        }
      }
    }

    checkUser()

    return () => {
      isMounted = false
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl font-bold tracking-tight text-gray-50 sm:text-6xl font-sans"
            variants={itemVariants}
          >
            Meet Your Intelligent <br/>
              <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Security Assistant
            </span>
          </motion.h1>
          <motion.p
            className="mt-6 text-lg leading-8 text-gray-400"
            variants={itemVariants}
          >
            The AI-powered bot to help you review, secure, and ship code with confidence. 
            Designed for vibe-coders who want to learn while they build.
          </motion.p>
          <motion.div
            className="mt-10 flex items-center justify-center gap-x-6"
            variants={itemVariants}
          >
            {authChecking ? (
              <motion.button
                disabled
                className="group relative rounded-full bg-gray-900/70 px-8 py-3.5 text-sm font-semibold text-gray-300 shadow-lg shadow-indigo-500/20 border border-gray-800 flex items-center justify-center gap-2 mx-auto overflow-hidden cursor-wait"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-60" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-400" />
                </span>
                <span className="relative z-10">Checking your session...</span>
              </motion.button>
            ) : isAuthenticated ? (
              <motion.div
                className="inline-flex items-center gap-2 rounded-full bg-gray-900/80 px-6 py-3 text-sm font-medium text-gray-400 border border-gray-800 shadow-md cursor-default"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <span className="relative flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/30 blur-[2px]" />
                  <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/90 text-[10px] text-gray-950">
                    ✓
                  </span>
                </span>
                <span>You&apos;re already logged in with GitHub</span>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="https://github.com/apps/unvibe-bot"
                  className="group relative rounded-full bg-linear-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all flex items-center justify-center gap-2 mx-auto overflow-hidden"
                >
                  <span className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10">Install Bot</span>
                </Link>
              </motion.div>
            )}
          </motion.div>
          
          <motion.div
            className="mt-10 grid gap-4 text-sm text-gray-400 sm:grid-cols-3"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center gap-3 rounded-xl border border-gray-800/80 bg-gray-900/60 px-4 py-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="inline-flex items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                24/7
              </span>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-gray-200">Always-on review</p>
                <p className="text-[11px] text-gray-500">Security checks on every pull request.</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 rounded-xl border border-gray-800/80 bg-gray-900/60 px-4 py-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="inline-flex items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                +SEC
              </span>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-gray-200">Actionable fixes</p>
                <p className="text-[11px] text-gray-500">Concrete code suggestions, not vague tips.</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 rounded-xl border border-gray-800/80 bg-gray-900/60 px-4 py-3 sm:col-span-1 col-span-full"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span className="inline-flex items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-pink-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                LEARN
              </span>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-gray-200">Built for developers</p>
                <p className="text-[11px] text-gray-500">Understand every vulnerability as you go.</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

