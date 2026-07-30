import { redirect } from "next/navigation";

/** Legacy /learning → public My Learning hub */
export default function LegacyLearningRedirect() {
  redirect("/my-learning");
}
