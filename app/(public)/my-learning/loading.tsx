export default function Loading() {
  return (
    <div className="container-app section-y animate-pulse">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="mt-6 h-40 rounded-xl bg-muted" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-xl bg-muted" />
        <div className="h-28 rounded-xl bg-muted" />
      </div>
    </div>
  )
}
