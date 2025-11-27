import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function GithubSetupPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main className="flex min-h-[calc(100vh-160px)] flex-col items-center justify-center py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-serif">
            You&apos;re all set!
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Arruma has been successfully installed on your GitHub account.
            <br />
            We&apos;re ready to help you review and secure your code.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/"
              className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all"
            >
              Return Home
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              className="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
            >
              Go to GitHub
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

