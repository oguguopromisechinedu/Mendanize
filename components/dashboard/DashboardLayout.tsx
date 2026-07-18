/**
 * Legacy no-op — admin chrome lives in
 * `app/(dashboard)/dashboard/layout.tsx` via `DashboardShell` (MES-007).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
