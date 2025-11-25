import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white  border-t border-gray-200 ">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                A
              </div>
              <span className="text-xl font-bold text-gray-900 ">Arruma</span>
            </Link>
            <p className="text-sm leading-6 text-gray-600 ">
              Making security accessible for everyone. <br />
              Built for vibe-coders, by vibe-coders.
            </p>
            <div className="flex space-x-6">
              {/* Social Links */}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900 ">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 ">Features</a></li>
                  <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 ">Security</a></li>
                  <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 ">Pricing</a></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-gray-900 ">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 ">About</a></li>
                  <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 ">Blog</a></li>
                  <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 ">Careers</a></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900 ">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 ">Privacy</a></li>
                  <li><a href="#" className="text-sm leading-6 text-gray-600 hover:text-gray-900 ">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24 ">
          <p className="text-xs leading-5 text-gray-500 ">&copy; 2024 Arruma Labs Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

