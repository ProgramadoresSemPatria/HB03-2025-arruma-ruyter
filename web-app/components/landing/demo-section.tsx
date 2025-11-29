'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export function DemoSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-50 sm:text-4xl font-sans">
            Automated Security Reviews
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-400">
            Unvibe catches vulnerabilities before they merge. It comments directly on your PRs with actionable fixes.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          className="relative mx-auto max-w-4xl rounded-2xl bg-gray-900/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(15,23,42,0.9)] ring-1 ring-gray-800/80 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-800/50 px-4 py-3">
            <div className="flex gap-1.5">
              <motion.div
                className="h-3 w-3 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="mx-auto text-xs text-gray-400 font-mono">github.com/unvibe/web-app/pull/123</div>
          </div>

          <div className="flex flex-col md:flex-row">
            <motion.div
              className="flex-1 p-6 font-mono text-sm bg-gray-950/70 backdrop-blur-xl text-gray-300 overflow-x-auto border-r border-gray-800/80"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex gap-4">
                <div className="text-gray-600 select-none text-right w-6">1</div>
                <div><span className="text-purple-400">const</span> handler = <span className="text-purple-400">async</span> (req, res) ={">"} {"{"}</div>
              </div>
              <motion.div
                className="flex gap-4 bg-red-950/30 -mx-6 px-6 border-l-4 border-red-500 my-1"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="text-gray-600 select-none text-right w-6">2</div>
                <div>
                  &nbsp;&nbsp;<span className="text-purple-400">const</span> user = <span className="text-purple-400">await</span> db.query(
                </div>
              </motion.div>
              <motion.div
                className="flex gap-4 bg-red-950/30 -mx-6 px-6 border-l-4 border-red-500 my-1"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="text-gray-600 select-none text-right w-6">3</div>
                <div>
                  &nbsp;&nbsp;&nbsp;&nbsp;`<span className="text-green-400">SELECT * FROM users WHERE id = </span><span className="text-blue-400">{"${req.query.id}"}</span>`
                </div>
              </motion.div>
              <motion.div
                className="flex gap-4 bg-red-950/30 -mx-6 px-6 border-l-4 border-red-500 my-1"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <div className="text-gray-600 select-none text-right w-6">4</div>
                <div>
                  &nbsp;&nbsp;);
                </div>
              </motion.div>
              <div className="flex gap-4">
                <div className="text-gray-600 select-none text-right w-6">5</div>
                <div>&nbsp;&nbsp;res.json(user);</div>
              </div>
              <div className="flex gap-4">
                <div className="text-gray-600 select-none text-right w-6">6</div>
                <div>{"}"}</div>
              </div>
            </motion.div>

            <motion.div
              className="w-full md:w-96 border-l border-gray-800/80 bg-gray-900/60 backdrop-blur-xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-start gap-3">
                <motion.div
                  className="h-8 w-8 shrink-0 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  A
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-50">Unvibe Bot</p>
                    <span className="text-xs text-gray-400">Just now</span>
                  </div>
                  <motion.div
                    className="mt-1 rounded-md bg-gray-900 p-3 text-sm shadow-lg ring-1 ring-gray-700"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <p className="font-medium text-red-400 mb-2">
                      ⚠️ SQL Injection Vulnerability
                    </p>
                    <p className="text-gray-300 mb-3">
                      Directly interpolating user input allows attackers to execute arbitrary SQL.
                    </p>
                    <p className="text-xs font-mono bg-gray-800 p-2 rounded mb-2 text-gray-300">
                      db.query(&apos;SELECT * FROM users WHERE id = $1&apos;, [req.query.id])
                    </p>
                    <div className="flex gap-2 mt-2">
                      <motion.button
                        className="text-xs bg-indigo-600 text-indigo-100 px-2 py-1 rounded font-medium hover:bg-indigo-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Apply Fix
                      </motion.button>
                      <motion.button
                        className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Learn More
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

