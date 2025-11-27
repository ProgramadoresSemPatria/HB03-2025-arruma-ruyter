import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md ">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
              A
            </div>
            <span className="text-xl font-bold text-gray-900 ">Arruma</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 ">
              Pricing
            </Link>
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 ">
              Features
            </Link>
            <Link href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900 ">
              About
            </Link>
            <Link href="#blog" className="text-sm font-medium text-gray-600 hover:text-gray-900 ">
              Blog
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 "
          >
            Log In
          </Link>
          <Link
            href="/install"
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Install Bot
          </Link>
        </div>
      </div>
    </nav>
  );
}

