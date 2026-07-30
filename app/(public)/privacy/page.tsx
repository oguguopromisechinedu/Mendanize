import {
  CmsCompanyPage,
  generateCmsPageMetadata,
} from "@/features/static-pages/server"

export async function generateMetadata() {
  return generateCmsPageMetadata("privacy")
}

export default function PrivacyPage() {
  return <CmsCompanyPage slug="privacy" />
}
