import { Suspense } from 'react'
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { DemoSection } from "@/components/landing/demo-section";
import { Trust } from "@/components/landing/trust";
import { Footer } from "@/components/landing/footer";
import { MainGlowBackground } from "@/components/layout/main-glow-background";
import { ErrorNotification } from "@/components/error-notification";

export const dynamic = 'force-dynamic';

function HomeContent() {
  return (
    <div className="min-h-screen bg-gray-950 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <Suspense fallback={null}>
        <ErrorNotification />
      </Suspense>
      <MainGlowBackground>
        <main>
          <Hero />
          <Trust />
          <DemoSection />
          <Features />
        </main>
      </MainGlowBackground>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <p className="text-gray-600">Carregando...</p>
        </div>
        <Footer />
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
