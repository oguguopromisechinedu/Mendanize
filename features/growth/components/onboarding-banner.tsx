import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type OnboardingBannerProps = {
  notice?: string | null
}

const MESSAGES: Record<
  string,
  { variant: "success" | "warning" | "destructive" | "default"; title: string; body: string }
> = {
  "intent-employer": {
    variant: "default",
    title: "Register your company",
    body: "Create an employer profile to post jobs. Company accounts stay under /account and never open the Admin dashboard.",
  },
  "created-company": {
    variant: "success",
    title: "Company created",
    body: "Your employer profile is ready. You can post jobs from the hiring desk and submit the company for verification anytime.",
  },
  "onboarded-employer": {
    variant: "success",
    title: "Welcome to your employer dashboard",
    body: "Post jobs for Admin review, manage applications, and brand listings with your company when you’re ready.",
  },
  "onboarded-creator": {
    variant: "success",
    title: "You’re a creator",
    body: "Submit listings for Admin approval. Creator access never grants Admin dashboard permissions.",
  },
  "error-client-setup": {
    variant: "destructive",
    title: "Could not finish employer setup",
    body: "Marketplace tables may still need migration (npx prisma migrate deploy). Try again after setup, or contact support.",
  },
  "error-creator-setup": {
    variant: "destructive",
    title: "Could not enable creator access",
    body: "Marketplace tables may still need migration (npx prisma migrate deploy). Try again after setup, or contact support.",
  },
  "error-company-create": {
    variant: "destructive",
    title: "Could not create company",
    body: "Check the company name and try again. If this keeps happening, apply pending database migrations.",
  },
  "error-company-validation": {
    variant: "warning",
    title: "Company name required",
    body: "Enter a company name to continue employer registration.",
  },
  "saved-company": {
    variant: "success",
    title: "Profile updated",
    body: "Your company details were saved.",
  },
  "submitted-verification": {
    variant: "success",
    title: "Submitted for verification",
    body: "An Admin will review your company. You can keep hiring while verification is pending.",
  },
  "member-added": {
    variant: "success",
    title: "Team member added",
    body: "They can collaborate on company hiring from their learner account.",
  },
  "error-member": {
    variant: "destructive",
    title: "Could not add member",
    body: "Use an existing learner email address, or ask them to sign up first.",
  },
}

export function OnboardingBanner({ notice }: OnboardingBannerProps) {
  if (!notice) return null
  const message = MESSAGES[notice]
  if (!message) return null

  return (
    <Alert variant={message.variant} className="rounded-xl">
      <AlertTitle>{message.title}</AlertTitle>
      <AlertDescription>{message.body}</AlertDescription>
    </Alert>
  )
}

export function resolveCompanyNotice(params: {
  intent?: string | string[]
  created?: string | string[]
  error?: string | string[]
  saved?: string | string[]
  verified?: string | string[]
  member?: string | string[]
}): string | null {
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? null
  if (one(params.created) === "1") return "created-company"
  if (one(params.saved) === "1") return "saved-company"
  if (one(params.verified) === "1") return "submitted-verification"
  if (one(params.member) === "1") return "member-added"
  if (one(params.member) === "0") return "error-member"
  if (one(params.error) === "create") return "error-company-create"
  if (one(params.error) === "validation") return "error-company-validation"
  if (one(params.intent) === "employer") return "intent-employer"
  return null
}

export function resolveHiringNotice(params: {
  onboarded?: string | string[]
  error?: string | string[]
}): string | null {
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? null
  if (one(params.onboarded) === "1") return "onboarded-employer"
  if (one(params.error) === "client-setup") return "error-client-setup"
  return null
}

export function resolveCreatorNotice(params: {
  onboarded?: string | string[]
  error?: string | string[]
}): string | null {
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? null
  if (one(params.onboarded) === "1") return "onboarded-creator"
  if (one(params.error) === "creator-setup") return "error-creator-setup"
  return null
}
