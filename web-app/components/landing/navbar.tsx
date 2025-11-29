'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <motion.nav
      className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/60 backdrop-blur-2xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3L5 6v6c0 4 2.5 7.5 7 9 4.5-1.5 7-5 7-9V6l-7-3z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </motion.div>
            <span className="text-xl font-bold text-gray-50 group-hover:text-indigo-400 transition-colors">Unvibe</span>
          </Link>
        </motion.div>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {user ? (
              <motion.div
                key="authenticated"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-4"
              >
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Dashboard
                </Link>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-gradient-to-r from-red-600 to-red-700 px-5 py-2 text-sm font-medium text-white hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-500/20"
                >
                  Logout
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="unauthenticated"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/install"
                    className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Install Bot
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.nav>
  );
}

