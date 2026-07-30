import {
  CmsCompanyPage,
  generateCmsPageMetadata,
} from "@/features/static-pages/server"

export async function generateMetadata() {
  return generateCmsPageMetadata("faq")
}

export default function FaqPage() {
  return <CmsCompanyPage slug="faq" />
}
