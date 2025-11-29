'use client'

import Link from "next/link";
import { motion } from 'framer-motion'

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
            <p className="text-sm leading-6 text-gray-400">
              Making security accessible for everyone. <br />
              Built for vibe-coders, by vibe-coders.
            </p>
          </motion.div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h3 className="text-sm font-semibold leading-6 text-gray-50">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-indigo-400 transition-colors">Features</a></li>
                  <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-indigo-400 transition-colors">Security</a></li>
                  <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-indigo-400 transition-colors">Pricing</a></li>
                </ul>
              </motion.div>
              <motion.div
                className="mt-10 md:mt-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-sm font-semibold leading-6 text-gray-50">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-indigo-400 transition-colors">About</a></li>
                  <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-indigo-400 transition-colors">Blog</a></li>
                  <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-indigo-400 transition-colors">Careers</a></li>
                </ul>
              </motion.div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-sm font-semibold leading-6 text-gray-50">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-indigo-400 transition-colors">Privacy</a></li>
                  <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-indigo-400 transition-colors">Terms</a></li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
        <motion.div
          className="mt-16 border-t border-gray-800 pt-8 sm:mt-20 lg:mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-xs leading-5 text-gray-500">&copy; 2025 Unvibe Labs Inc. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}

