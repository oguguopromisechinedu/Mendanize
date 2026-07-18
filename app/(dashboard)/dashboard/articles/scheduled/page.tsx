import { makeStatusPage, statusMetadata } from "../_status-page"

export const metadata = statusMetadata("Scheduled articles")

export default makeStatusPage(
  "SCHEDULED",
  "Scheduled",
  "Articles queued to publish."
)
