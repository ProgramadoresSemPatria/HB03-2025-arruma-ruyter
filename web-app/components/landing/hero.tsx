import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-16  sm:pt-32 sm:pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900  sm:text-6xl font-serif">
            Meet Your Intelligent <br/>
            <span className="text-indigo-600">Security Assistant</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 ">
            The AI-powered bot to help you review, secure, and ship code with confidence. 
            Designed for vibe-coders who want to learn while they build.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/install"
              className="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
            >
              Start Securing - it's free
            </Link>
          </div>
          
          <div className="mt-10 flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 " />
              ))}
            </div>
            <p>Loved by PSP and Base</p>
          </div>
        </div>
      </div>
    </section>
  );
}

