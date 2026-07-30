import {
  CmsCompanyPage,
  generateCmsPageMetadata,
} from "@/features/static-pages/server"

export async function generateMetadata() {
  return generateCmsPageMetadata("about")
}

export default function AboutPage() {
  return <CmsCompanyPage slug="about" />
}
