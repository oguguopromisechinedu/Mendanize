import type { Metadata } from "next"
import Link from "next/link"

import { Container } from "@/components/ui/container"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Mendanize collects, uses, and protects your personal data.",
}

export default function PrivacyPolicyPage() {
  return (
    <Container size="lg" className="section-y prose prose-invert max-w-3xl">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: 23 July 2026</p>
      <p>
        Mendanize is an AI-powered technology learning platform. This policy
        describes what we collect and why — focused on real GDPR/CCPA
        obligations (MES-035).
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details (email, name) when you create a PublicUser account</li>
        <li>Learning preferences, saved content, and Ask conversation history</li>
        <li>Billing/subscription metadata when you subscribe (via Stripe)</li>
        <li>Optional analytics cookies if you consent</li>
      </ul>
      <h2>Your rights</h2>
      <ul>
        <li>
          <strong>Access / export</strong> — download your data as JSON from{" "}
          <Link href="/account/privacy">Account → Privacy</Link>
        </li>
        <li>
          <strong>Deletion</strong> — delete your account from the same page;
          we cancel billing first, then remove personal data
        </li>
        <li>
          <strong>Consent</strong> — control analytics cookies via the banner on
          first visit
        </li>
      </ul>
      <h2>Admin data</h2>
      <p>
        Staff Admin accounts are separate from learner accounts. Admin actions
        are audit-logged. Ask-triggered AI drafts never expose your identity to
        the Admin Knowledge Center.
      </p>
      <h2>Contact</h2>
      <p>
        Questions:{" "}
        <Link href="/contact">Contact</Link> or privacy@mendanize.com.
      </p>
    </Container>
  )
}
