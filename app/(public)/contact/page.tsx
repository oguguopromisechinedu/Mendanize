import {
  CmsCompanyPage,
  generateCmsPageMetadata,
} from "@/features/static-pages/server"

export async function generateMetadata() {
  return generateCmsPageMetadata("contact")
}

export default function ContactPage() {
  return <CmsCompanyPage slug="contact" />
}
