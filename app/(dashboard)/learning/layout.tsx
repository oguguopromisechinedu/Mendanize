import { redirect } from "next/navigation";

export default function LegacyLearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirect("/account");
  return children;
}
