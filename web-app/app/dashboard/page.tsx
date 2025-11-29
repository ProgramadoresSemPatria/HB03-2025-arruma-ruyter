'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/landing/navbar'
import { supabase } from '@/lib/supabase/client'
import { getInstallationIdFromUrl } from '@/lib/utils/url-params'
import type { User } from '@supabase/supabase-js'

const AI_MODELS = [
  { id: 'sonnet-4.5', name: 'Claude Sonnet 4.5' },
  { id: 'gpt-5.1', name: 'GPT-5.1' },
  { id: 'gemini-3.0', name: 'Gemini 3.0' }
]

function DashboardContent() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set())
  const [installationId, setInstallationId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)

        // Fetch user's installation
        try {
          const response = await fetch('/api/installations/get')
          if (response.ok) {
            const { data: installation } = await response.json()
            if (installation?.installation_id) {
              setInstallationId(installation.installation_id.toString())
            }
          }
        } catch (error) {
          console.error('Failed to fetch installation:', error)
        }

        // Fetch bot configuration
        try {
          const response = await fetch('/api/bot-config')
          if (response.ok) {
            const { data: config } = await response.json()
            if (config && config.model_name) {
              const models = Array.isArray(config.model_name) 
                ? config.model_name 
                : JSON.parse(config.model_name)
              setSelectedModels(new Set(models))
            }
          }
        } catch (error) {
          console.error('Failed to fetch bot config:', error)
        }
      }
      setLoading(false)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
        } else if (event === 'SIGNED_IN') {
          setUser(session.user)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [searchParams])

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    setSaveError(null)

    try {
      const response = await fetch('/api/bot-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_names: Array.from(selectedModels),
          installation_id: installationId ? parseInt(installationId) : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save configuration')
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save bot config:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save configuration')
      setTimeout(() => setSaveError(null), 5000)
    } finally {
      setSaving(false)
    }
  }

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
                            key={model.id}
                            className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedModels.has(model.id)}
                              onChange={() => toggleModel(model.id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              {model.name}
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
                    {getSelectedModelsList().map((modelId) => {
                      const model = AI_MODELS.find(m => m.id === modelId)
                      return (
                        <div
                          key={modelId}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg"
                        >
                          <span className="text-sm font-medium text-indigo-900">
                            {model?.name || modelId}
                          </span>
                          <button
                            onClick={() => toggleModel(modelId)}
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
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between">
                <div className="flex-1">
                  {saveSuccess && (
                    <div className="flex items-center text-green-600">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium">Configuração salva com sucesso!</span>
                    </div>
                  )}
                  {saveError && (
                    <div className="flex items-center text-red-600">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm font-medium">{saveError}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || selectedModels.size === 0}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </span>
                  ) : (
                    'Salvar Configuração'
                  )}
                </button>
              </div>
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

