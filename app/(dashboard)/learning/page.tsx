import { redirect } from "next/navigation";

/** MES-030: learner personalization moved to /account/* */
export default function LegacyLearningRedirect() {
  redirect("/account");
}
