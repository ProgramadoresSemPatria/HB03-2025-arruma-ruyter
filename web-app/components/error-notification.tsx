'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

export function ErrorNotification() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams?.get('error')
    const messageParam = searchParams?.get('message')
    
    queueMicrotask(() => {
      if (errorParam === 'database_error') {
        setError(
          messageParam 
            ? decodeURIComponent(messageParam)
            : 'Erro ao criar usuário no banco de dados. Verifique os logs do Supabase.'
        )
      } else if (errorParam === 'auth_failed') {
        setError('Erro ao fazer autenticação. Tente novamente.')
      } else {
        setError(null)
      }
    })
  }, [searchParams])

  if (!error) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-950/50 border-l-4 border-red-500 p-4 mx-auto max-w-7xl mt-4 rounded-r-lg backdrop-blur-sm"
    >
      <div className="flex">
        <div className="shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-300">{error}</p>
          <p className="mt-2 text-xs text-red-400">
            💡 Dica: Verifique o arquivo <code className="bg-red-900/50 px-1 rounded text-red-200">TROUBLESHOOTING-DATABASE-ERROR.md</code> para mais informações.
          </p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

