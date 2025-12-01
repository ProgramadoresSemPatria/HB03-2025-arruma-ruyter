import { Suspense } from 'react'
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { AppBackground } from "@/components/layout/app-background";
import { GithubSetupContent } from "@/components/github-setup-content";

export const dynamic = 'force-dynamic';

export default function GithubSetupPage() {
  return (
    <AppBackground>
      <Navbar />
      <main className="flex min-h-[calc(100vh-160px)] flex-col items-center justify-center py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <Suspense fallback={
            <p className="text-gray-400">Carregando...</p>
          }>
            <GithubSetupContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </AppBackground>
  )
}
