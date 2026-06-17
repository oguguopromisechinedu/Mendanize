'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
      </div>

      {/* Error Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="max-w-md space-y-6">
          {/* Error Icon */}
          <div>
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Dashboard Error</h2>
            <p className="text-slate-400">
              Failed to load dashboard. Please try again.
            </p>
          </div>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-left">
              <p className="text-xs font-mono text-red-400 break-words">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.href = '/sign-in'}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition-colors"
            >
              Sign In Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
