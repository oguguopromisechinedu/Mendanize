import { notFound } from "next/navigation";
import MarketingLayout from "@/components/layout/MarketingLayout";
import ToolRunner from "@/components/tools/ToolRunner";
import { getToolById } from "@/lib/tools/registry";
import type { Metadata } from "next";

type Props = { params: Promise<{ toolId: string }> };

export async function generateStaticParams() {
  const { aiTools } = await import("@/lib/tools/registry");
  return aiTools.map((t) => ({ toolId: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { toolId } = await params;
  const tool = getToolById(toolId);
  return {
    title: tool?.name ?? "AI Tool",
    description: tool?.description,
  };
}

export default async function ToolPage({ params }: Props) {
  const { toolId } = await params;
  const tool = getToolById(toolId);
  if (!tool) notFound();

  // Explicitly construct serializable tool object (remove icon and buildPrompt)
  const toolForClient = {
    id: tool.id,
    name: tool.name,
    description: tool.description,
    iconName: tool.iconName,
    category: tool.category,
    href: tool.href,
    model: tool.model,
    systemPrompt: tool.systemPrompt,
    fields: tool.fields,
  };

  return (
    <MarketingLayout>
      <section className="bg-black px-6 py-12 text-white sm:px-10">
        <ToolRunner tool={toolForClient} />
      </section>
    </MarketingLayout>
  );
}
