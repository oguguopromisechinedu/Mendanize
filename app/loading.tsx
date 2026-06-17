export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Skeleton */}
      <div className="border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-32 bg-slate-800 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Hero Skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-64 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-slate-800 rounded-lg animate-pulse" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4"
            >
              <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
              <div className="h-8 w-32 bg-slate-800 rounded animate-pulse" />
              <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
