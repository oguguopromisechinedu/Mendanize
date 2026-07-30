import {
  CmsCompanyPage,
  generateCmsPageMetadata,
} from "@/features/static-pages/server"

export async function generateMetadata() {
  return generateCmsPageMetadata("careers")
}

export default function CareersPage() {
  return <CmsCompanyPage slug="careers" />
}
