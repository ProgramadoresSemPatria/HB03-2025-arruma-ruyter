'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getInstallationIdFromUrl } from '@/lib/utils/url-params'

export function Hero() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

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

  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-16  sm:pt-32 sm:pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900  sm:text-6xl font-serif">
            Meet Your Intelligent <br/>
            <span className="text-indigo-600">Security Assistant</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 ">
            The AI-powered bot to help you review, secure, and ship code with confidence. 
            Designed for vibe-coders who want to learn while they build.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={handleGitHubLogin}
              disabled={loading}
              className="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {loading ? 'Carregando...' : 'Login with GitHub'}
            </button>
          </div>
          
          <div className="mt-10 flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 " />
              ))}
            </div>
            <p>Loved by PSP and Base</p>
          </div>
        </div>
      </div>
    </section>
  );
}

