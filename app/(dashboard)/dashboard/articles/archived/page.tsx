import { makeStatusPage, statusMetadata } from "../_status-page"

export const metadata = statusMetadata("Archived articles")

export default makeStatusPage(
  "ARCHIVED",
  "Archived",
  "Retired articles retained for history."
)
