import type { Metadata } from "next";
import { adminListCertificateTemplates } from "@/services/ecosystem";
import { CertificatesAdminView } from "@/features/ecosystem-admin";

export const metadata: Metadata = {
  title: "Certificates",
  robots: { index: false },
};

export default async function Page() {
  const templates = await adminListCertificateTemplates().catch(() => []);
  return <CertificatesAdminView templates={templates} />;
}
