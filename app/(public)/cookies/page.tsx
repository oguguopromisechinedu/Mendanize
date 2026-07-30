import {
  CmsCompanyPage,
  generateCmsPageMetadata,
} from "@/features/static-pages/server"

export async function generateMetadata() {
  return generateCmsPageMetadata("cookies")
}

export default function CookiesPage() {
  return <CmsCompanyPage slug="cookies" />
}
