import ChatWorkspace from "@/components/workspace/ChatWorkspace";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Workspace",
  description: "Chat with Mendanize AI — streaming, markdown, and premium UX.",
};

export default function WorkspacePage() {
  return (
    <div className="min-h-screen bg-black">
      <ChatWorkspace />
    </div>
  );
}
