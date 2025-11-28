'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/landing/navbar'
import { supabase } from '@/lib/supabase/client'
import { getInstallationIdFromUrl } from '@/lib/utils/url-params'
import type { User } from '@supabase/supabase-js'

const AI_MODELS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Llama',
  'Mistral'
]

function DashboardContent() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function loadUser() {
      const installationIdFromUrl = searchParams?.get('installation_id') || 
                                    (typeof window !== 'undefined' ? getInstallationIdFromUrl() : null)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        const installationIdToSave = installationIdFromUrl || 
                                     localStorage.getItem('pending_installation_id') ||
                                     null
        
        if (installationIdToSave && !user.user_metadata?.installation_id) {
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              ...user.user_metadata,
              installation_id: installationIdToSave,
            },
          })
          
          if (!updateError) {
            if (localStorage.getItem('pending_installation_id')) {
              localStorage.removeItem('pending_installation_id')
            }
            
            const { data: { user: updatedUser } } = await supabase.auth.getUser()
            if (updatedUser) {
              setUser(updatedUser)
            }
          }
        } else if (user.user_metadata?.installation_id) {
          if (localStorage.getItem('pending_installation_id')) {
            localStorage.removeItem('pending_installation_id')
          }
        }
      }
      setLoading(false)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
        } else if (event === 'SIGNED_IN') {
          setUser(session.user)
          
          const pendingInstallationId = localStorage.getItem('pending_installation_id')
          
          if (pendingInstallationId && session.user && !session.user.user_metadata?.installation_id) {
            const { error: updateError } = await supabase.auth.updateUser({
              data: {
                ...session.user.user_metadata,
                installation_id: pendingInstallationId,
              },
            })
            
            if (!updateError) {
              localStorage.removeItem('pending_installation_id')
              const { data: { user: updatedUser } } = await supabase.auth.getUser()
              if (updatedUser) {
                setUser(updatedUser)
              }
            }
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [searchParams])

  const toggleModel = (modelName: string) => {
    setSelectedModels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(modelName)) {
        newSet.delete(modelName)
      } else {
        newSet.add(modelName)
      }
      return newSet
    })
  }

  const getSelectedModelsList = () => {
    return Array.from(selectedModels)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      
      <main className="pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Dashboard
              </h1>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Configure os modelos de IA que você deseja usar no bot
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Modelos de IA
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Selecione os modelos de IA que você quer que o bot utilize
                </p>
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-colors"
                  >
                    <span className="text-sm text-gray-700">
                      {selectedModels.size === 0
                        ? 'Selecione os modelos de IA'
                        : `${selectedModels.size} modelo(s) selecionado(s)`}
                    </span>
                    <svg
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        isDropdownOpen ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                      <div className="p-2">
                        {AI_MODELS.map((model) => (
                          <label
                            key={model}
                            className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedModels.has(model)}
                              onChange={() => toggleModel(model)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              {model}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedModels.size > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Modelos Selecionados
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getSelectedModelsList().map((model) => (
                      <div
                        key={model}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg"
                      >
                        <span className="text-sm font-medium text-indigo-900">
                          {model}
                        </span>
                        <button
                          onClick={() => toggleModel(model)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
