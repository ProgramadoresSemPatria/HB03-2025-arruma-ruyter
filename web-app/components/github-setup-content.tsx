'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link";
import { supabase } from '@/lib/supabase/client'

export function GithubSetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const installationId = searchParams.get('installation_id')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsAuthenticated(false)
      } else {
        setIsAuthenticated(true)
      }
    }

    checkAuth()
  }, [])

  const handleGitHubLogin = async () => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // User is already authenticated, redirect to dashboard
        router.push('/dashboard')
        return
      }

      // Build the redirect URL with installation_id if present
      const redirectTo = installationId
        ? `${window.location.origin}/auth/callback?installation_id=${encodeURIComponent(installationId)}`
        : `${window.location.origin}/auth/callback`

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo,
        },
      })

      if (oauthError) {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-400/40">
        <svg
          className="h-8 w-8 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight text-gray-50 sm:text-5xl font-sans">
        You&apos;re all set!
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-400">
        {isAuthenticated 
          ? (
            <>
              Unvibe has been successfully installed on your GitHub account.
              <br />
              We&apos;re ready to help you review and secure your code.
            </>
          ) : (
            <>
              Unvibe has been successfully installed on your GitHub account.
              <br />
              Please log in with GitHub to access your dashboard.
            </>
          )
        }
      </p>

      {isAuthenticated === null ? (
        <div className="mt-10">
          <p className="text-gray-400">Carregando...</p>
        </div>
      ) : isAuthenticated ? (
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-full bg-gray-900 px-8 py-3.5 text-sm font-semibold text-gray-100 shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-800 transition-all"
          >
            Return Home
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-linear-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-purple-500 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="rounded-full bg-linear-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {loading ? 'Carregando...' : 'Login with GitHub'}
          </button>
          <Link
            href="/"
            className="rounded-full bg-gray-900 px-8 py-3.5 text-sm font-semibold text-gray-100 shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-800 transition-all"
          >
            Return Home
          </Link>
        </div>
      )}
    </>
  )
}

