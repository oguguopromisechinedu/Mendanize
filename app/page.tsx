import type { Metadata } from "next";
import { MendanizeLanding } from "@/components/marketing/MendanizeLanding";

export const metadata: Metadata = {
  title: "Learn. Build. Work. Earn.",
  description:
    "Mendanize brings learning, building, work, and digital products together in one intelligent platform.",
};

export default function HomePage() {
  return <MendanizeLanding />;
}
