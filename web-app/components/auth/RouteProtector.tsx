'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface RouteProtectorProps {
  children: React.ReactNode
  protectedRoutes?: string[]
}

export function RouteProtector({ 
  children, 
  protectedRoutes = ['/dashboard'] 
}: RouteProtectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)

      const isProtectedRoute = protectedRoutes.some(route => 
        pathname.startsWith(route)
      )

      if (!user && isProtectedRoute) {
        router.push('/')
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const newUser = session?.user || null
        setUser(newUser)

        const isProtectedRoute = protectedRoutes.some(route => 
          pathname.startsWith(route)
        )

        if (event === 'SIGNED_OUT' && isProtectedRoute) {
          router.push('/')
        }

        if (event === 'SIGNED_IN' && !newUser && isProtectedRoute) {
          router.push('/')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router, protectedRoutes])

  if (loading) {
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isProtectedRoute) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticação...</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

