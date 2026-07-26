import Link from "next/link";
import { Award, ExternalLink } from "lucide-react";

import { AdminPageHeader, AdminPanel, AdminEmptyState } from "@/features/admin-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CertificateRecord } from "@/services/ecosystem";

function CertCard({ cert }: { cert: CertificateRecord }) {
  const issued = new Date(cert.issuedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AdminPanel>
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {cert.template.badgeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cert.template.badgeUrl}
              alt={cert.template.title}
              className="size-10 rounded-full object-contain"
            />
          ) : (
            <Award className="size-6" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground">{cert.template.title}</h3>
          {cert.template.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {cert.template.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Issued {issued}
            </Badge>
            <Badge variant="secondary" className="font-mono text-xs">
              {cert.credentialCode}
            </Badge>
          </div>
          <Button asChild size="sm" variant="outline" className="mt-3">
            <Link href={`/account/guides`}>
              <ExternalLink className="mr-1.5 size-3.5" />
              View guide
            </Link>
          </Button>
        </div>
      </div>
    </AdminPanel>
  );
}

export function CertificatesView({ certificates }: { certificates: CertificateRecord[] }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="Certificates"
        description="Your earned certificates from completed Mendanize guides. Each certificate includes a unique credential code."
      />

      {certificates.length === 0 ? (
        <AdminEmptyState
          title="No certificates yet"
          description="Complete a guide that has a certificate attached to earn your first credential."
          actionLabel="Browse guides"
          href="/account/guides"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((cert) => (
            <CertCard key={cert.id} cert={cert} />
          ))}
        </div>
      )}

      {certificates.length > 0 && (
        <AdminPanel title="About your credentials">
          <p className="text-sm text-muted-foreground">
            Each credential code is unique to you and permanently linked to your Mendanize account.
            Share your credential code to verify your certificate. Platform-managed verification —
            no external accounts required.
          </p>
        </AdminPanel>
      )}
    </div>
  );
}
