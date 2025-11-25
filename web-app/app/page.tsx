import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { DemoSection } from "@/components/landing/demo-section";
import { Trust } from "@/components/landing/trust";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white  font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main>
        <Hero />
        <Trust />
        <DemoSection />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
