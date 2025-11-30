'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const installationId = searchParams.get('installation_id')
      
      console.log('🔍 [CALLBACK PAGE] Installation ID:', installationId)

      try {
        // Wait for Supabase to process the OAuth session from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ [CALLBACK PAGE] Session error:', sessionError)
          setError('Authentication failed')
          setTimeout(() => router.push('/?error=auth_failed'), 2000)
          return
        }

        if (!session) {
          console.error('❌ [CALLBACK PAGE] No session found')
          setError('No session found')
          setTimeout(() => router.push('/?error=no_session'), 2000)
          return
        }

        console.log('✅ [CALLBACK PAGE] Session found for user:', session.user.id)

        // If we have an installation_id, save it via the API route
        if (installationId) {
          console.log('🚀 [CALLBACK PAGE] Saving installation...')
          
          const response = await fetch('/api/installations/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              installation_id: installationId,
              user_id: session.user.id,
              github_username: session.user.user_metadata?.user_name || session.user.user_metadata?.preferred_username,
              account_type: session.user.user_metadata?.account_type || 'User',
            }),
          })

          if (!response.ok) {
            console.error('❌ [CALLBACK PAGE] Failed to save installation')
            setError('Failed to save installation')
            setTimeout(() => router.push('/?error=installation_save_failed'), 2000)
            return
          }

          console.log('✅ [CALLBACK PAGE] Installation saved successfully')
        }

        // Redirect to dashboard
        console.log('🔄 [CALLBACK PAGE] Redirecting to dashboard...')
        router.push('/dashboard')
      } catch (err) {
        console.error('❌ [CALLBACK PAGE] Unexpected error:', err)
        setError('An unexpected error occurred')
        setTimeout(() => router.push('/?error=unexpected_error'), 2000)
      }
    }

    handleCallback()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-red-600 text-lg font-semibold">Error: {error}</div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}

