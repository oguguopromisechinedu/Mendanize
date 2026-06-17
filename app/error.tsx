'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console in development
    console.error('Error caught by error boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
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
          <h1 className="text-3xl font-bold">Oops! Something went wrong</h1>
          <p className="text-slate-400">
            We encountered an unexpected error. Our team has been notified.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-left">
            <p className="text-xs font-mono text-red-400 break-words">
              {error.message || 'Unknown error'}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-slate-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition-colors"
          >
            Go Home
          </Link>
        </div>

        {/* Support */}
        <p className="text-xs text-slate-500 pt-4">
          Error ID: {error.digest || 'unknown'} • Please contact support if this persists
        </p>
      </div>
    </div>
  )
}
