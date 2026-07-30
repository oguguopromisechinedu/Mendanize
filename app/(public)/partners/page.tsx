import {
  CmsCompanyPage,
  generateCmsPageMetadata,
} from "@/features/static-pages/server"

export async function generateMetadata() {
  return generateCmsPageMetadata("partners")
}

export default function PartnersPage() {
  return <CmsCompanyPage slug="partners" />
}
