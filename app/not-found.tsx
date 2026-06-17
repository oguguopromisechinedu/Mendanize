import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 Icon */}
        <div className="flex justify-center">
          <div className="text-8xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
            404
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Page Not Found</h1>
          <p className="text-slate-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action */}
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold transition-colors"
        >
          Go Home
        </Link>

        {/* Quick Links */}
        <div className="pt-8 space-y-2">
          <p className="text-sm text-slate-500 font-semibold">Quick Links:</p>
          <div className="flex gap-4 justify-center text-sm">
            <Link href="/" className="text-violet-400 hover:text-violet-300">
              Home
            </Link>
            <Link href="/pricing" className="text-violet-400 hover:text-violet-300">
              Pricing
            </Link>
            <Link href="/sign-in" className="text-violet-400 hover:text-violet-300">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
