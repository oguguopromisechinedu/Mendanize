import { makeStatusPage, statusMetadata } from "../_status-page"

export const metadata = statusMetadata("Published articles")

export default makeStatusPage(
  "PUBLISHED",
  "Published",
  "Live articles on the Learn pillar (public pages land in MES-024)."
)
