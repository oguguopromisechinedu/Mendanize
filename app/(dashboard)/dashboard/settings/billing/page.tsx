import { redirect } from "next/navigation";

/** MES-030: learner billing moved to /account/billing */
export default function LegacyBillingRedirect() {
  redirect("/account/billing");
}
