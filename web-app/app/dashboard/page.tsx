'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/landing/navbar'
import { supabase } from '@/lib/supabase/client'
import { getInstallationIdFromUrl } from '@/lib/utils/url-params'
import type { User } from '@supabase/supabase-js'
import { AppBackground } from '@/components/layout/app-background'

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
    async function loadData() {
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

    loadData()
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
      <AppBackground>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-3 rounded-full bg-gray-900/80 px-5 py-2 border border-gray-800 shadow-lg"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-400" />
            </span>
            <p className="text-sm text-gray-200">Carregando seu dashboard...</p>
          </motion.div>
        </div>
      </AppBackground>
    )
  }

  return (
    <AppBackground>
      <Navbar />
      
      <main className="pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="mb-10">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 border border-indigo-500/30 text-xs font-medium text-indigo-300 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M12 3L4 9v12h16V9l-8-6z"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>AI Control Center</span>
              </motion.div>

              <motion.h1
                className="text-4xl font-bold tracking-tight text-gray-50 sm:text-5xl font-sans"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                Dashboard
              </motion.h1>

              <motion.p
                className="mt-4 text-lg leading-8 text-gray-400"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Configure the AI models your bot can use and fine-tune how Unvibe interacts with
                your codebase.
              </motion.p>

              <AnimatePresence>
                {user?.email && (
                  <motion.div
                    key="user-chip"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.25 }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-gray-900/80 px-3 py-1 border border-gray-800 text-xs text-gray-300"
                  >
                    <svg
                      className="h-3.5 w-3.5 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M5 12l4 4L19 6"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-medium">Logado como</span>
                    <span className="text-gray-200">{user.email}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              className="rounded-2xl border border-gray-800 bg-linear-to-b from-gray-950 via-gray-900 to-gray-950/80 p-8 shadow-[0_0_40px_rgba(15,23,42,0.8)]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                className="mb-6 flex items-start justify-between gap-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 text-white">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          d="M12 3v18M5 7h9M5 12h9M5 17h9"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-100">
                        Modelos de IA
                      </p>
                      <p className="text-xs text-gray-400">
                        Selecione quais modelos seu bot pode chamar durante as análises.
                      </p>
                    </div>
                  </div>
                </div>

                <motion.span
                  className="inline-flex items-center gap-1 rounded-full bg-gray-900/70 px-2.5 py-1 text-[10px] font-medium text-gray-400 border border-gray-800"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Orquestração multi-modelo
                </motion.span>
              </motion.div>

              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Combine diferentes LLMs para equilibrar qualidade, custo e latência. Unvibe pode
                  escolher automaticamente o melhor modelo para cada tarefa.
                </p>

                <div className="relative mt-4">
                  <motion.button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/80 border border-gray-800 rounded-lg shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-500/60 transition-all"
                  >
                    <span className="flex items-center gap-2 text-sm text-gray-200">
                      <svg
                        className="h-4 w-4 text-indigo-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          d="M4 6h16M6 12h12M10 18h4"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {selectedModels.size === 0
                        ? 'Selecione os modelos de IA'
                        : `${selectedModels.size} modelo(s) selecionado(s)`}
                    </span>
                    <motion.svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        key="models-dropdown"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute z-10 mt-2 w-full bg-gray-950 border border-gray-800 rounded-xl shadow-2xl max-h-96 overflow-y-auto"
                      >
                        <div className="p-2">
                          {AI_MODELS.map((model) => (
                            <label
                              key={model}
                              className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-900 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-900 border border-gray-800 text-xs text-gray-300">
                                  {model[0]}
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-gray-100">
                                    {model}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {model === 'ChatGPT' && 'OpenAI · equilíbrio entre custo e qualidade'}
                                    {model === 'Claude' && 'Anthropic · ótimo para contextos longos'}
                                    {model === 'Gemini' && 'Google · forte em contexto multimodal'}
                                    {model === 'Llama' && 'Meta · modelo aberto e flexível'}
                                    {model === 'Mistral' && 'Mistral · rápido e econômico'}
                                  </p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={selectedModels.has(model)}
                                onChange={() => toggleModel(model)}
                                className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-gray-600 rounded bg-gray-900"
                              />
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <AnimatePresence>
                {selectedModels.size > 0 && (
                  <motion.div
                    key="selected-models"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 pt-6 border-t border-gray-800"
                  >
                    <h3 className="text-sm font-semibold text-gray-100 mb-3 flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-indigo-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Modelos selecionados
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Esses modelos serão usados nas próximas execuções do bot.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedModelsList().map((model) => (
                        <motion.div
                          key={model}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/40 rounded-full"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                          <span className="text-xs font-medium text-indigo-100">
                            {model}
                          </span>
                          <button
                            onClick={() => toggleModel(model)}
                            className="text-indigo-300 hover:text-indigo-100 transition-colors"
                          >
                            <svg
                              className="h-3.5 w-3.5"
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
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </AppBackground>
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

