import {
  CmsCompanyPage,
  generateCmsPageMetadata,
} from "@/features/static-pages/server"

export async function generateMetadata() {
  return generateCmsPageMetadata("terms")
}

export default function TermsPage() {
  return <CmsCompanyPage slug="terms" />
}
