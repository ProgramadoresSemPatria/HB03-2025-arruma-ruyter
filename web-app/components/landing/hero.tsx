'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { getInstallationIdFromUrl } from '@/lib/utils/url-params'

export function Hero() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (isMounted) {
          setIsAuthenticated(!!user)
        }
      } catch {
      }
    }

    checkUser()

    return () => {
      isMounted = false
    }
  }, [])

  const handleGitHubLogin = async () => {
    setLoading(true)

    try {
      const installationId = searchParams?.get('installation_id') || getInstallationIdFromUrl()
      
      const { data: { user }, error: getUserError } = await supabase.auth.getUser()
      
      const expectedErrors = ['Auth session missing!', 'User not found']
      const isExpectedError = getUserError && expectedErrors.some(
        expectedError => getUserError.message?.includes(expectedError)
      )
      
      if (getUserError && !isExpectedError) {
        setLoading(false)
        return
      }
      
      if (user) {
        if (installationId) {
          await supabase.auth.updateUser({
            data: {
              ...user.user_metadata,
              installation_id: installationId,
            },
          })
        }
        router.push('/dashboard')
        return
      }

      if (installationId) {
        localStorage.setItem('pending_installation_id', installationId)
      }

      const redirectTo = installationId
        ? `${window.location.origin}/auth/callback?installation_id=${encodeURIComponent(installationId)}`
        : `${window.location.origin}/auth/callback`

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo,
        },
      })

      if (oauthError) {
        setLoading(false)
      } else if (data?.url) {
        try {
          window.location.href = data.url
        } catch {
          window.location.replace(data.url)
        }
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

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
            {isAuthenticated ? (
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
              <motion.button
                onClick={handleGitHubLogin}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative rounded-full bg-linear-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mx-auto overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
                <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="relative z-10">{loading ? 'Carregando...' : 'Login with GitHub'}</span>
              </motion.button>
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

