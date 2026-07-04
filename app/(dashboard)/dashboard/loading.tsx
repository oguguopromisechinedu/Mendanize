export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Skeleton */}
      <div className="border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-32 bg-slate-800 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Sidebar Skeleton (if shown) */}
      <div className="flex">
        <div className="hidden md:block w-64 border-r border-slate-800 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-8 space-y-6">
          {/* Title Skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-800 rounded-lg animate-pulse" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3"
              >
                <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
                <div className="h-8 w-24 bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Content Table Skeleton */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-3">
            <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
