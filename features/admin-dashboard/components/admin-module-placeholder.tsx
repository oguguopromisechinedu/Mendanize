import { AdminEmptyState, AdminPageHeader } from "./admin-primitives"

export function AdminModulePlaceholder({
  title,
  description,
  upcomingSpec,
}: {
  title: string
  description: string
  upcomingSpec?: string
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader title={title} description={description} />
      <AdminEmptyState
        title={`${title} is scaffolded`}
        description={
          upcomingSpec
            ? `Management UI and business logic land in ${upcomingSpec}. Navigation and shell are ready.`
            : "Management UI and business logic land in a later MES. Navigation and shell are ready."
        }
      />
    </div>
  )
}
