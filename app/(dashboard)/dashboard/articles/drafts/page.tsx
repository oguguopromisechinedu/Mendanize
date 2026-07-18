import { makeStatusPage, statusMetadata } from "../_status-page"

export const metadata = statusMetadata("Draft articles")

export default makeStatusPage(
  "DRAFT",
  "Drafts",
  "Articles still being written."
)
