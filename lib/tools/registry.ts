import type { LucideIcon } from "lucide-react";
import {
  Camera,
  Mail,
  Package,
  PenLine,
  Lightbulb,
  Megaphone,
  Video,
  Briefcase,
  Bot,
  Search,
} from "lucide-react";

export type ToolField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

export type AITool = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  iconName: string;
  category: "content" | "marketing" | "business" | "creative";
  href: string;
  model?: string;
  systemPrompt: string;
  fields: ToolField[];
  buildPrompt: (values: Record<string, string>) => string;
};

const baseWriter =
  "You are Mendanize, a premium AI assistant. Write clear, compelling, production-ready copy. Use markdown when appropriate.";

export const aiTools: AITool[] = [
  {
    id: "blog-generator",
    name: "Blog Generator",
    description: "Long-form SEO blog posts with structure and CTAs.",
    icon: PenLine,
    iconName: "PenLine",
    category: "content",
    href: "/tools/blog-generator",
    systemPrompt: `${baseWriter} You specialize in SEO blog writing.`,
    fields: [
      { name: "topic", label: "Topic", type: "text", required: true, placeholder: "e.g. AI for small business" },
      { name: "tone", label: "Tone", type: "select", options: ["Professional", "Casual", "Bold", "Educational"] },
      { name: "audience", label: "Audience", type: "text", placeholder: "e.g. startup founders" },
      { name: "keywords", label: "SEO keywords", type: "text", placeholder: "comma-separated" },
    ],
    buildPrompt: (v) =>
      `Write a detailed SEO blog post in markdown.\nTopic: ${v.topic}\nTone: ${v.tone ?? "Professional"}\nAudience: ${v.audience ?? "general"}\nKeywords: ${v.keywords ?? "none"}\nInclude H1, intro, H2/H3 sections, examples, and a CTA conclusion.`,
  },
  {
    id: "seo-generator",
    name: "SEO Generator",
    description: "Meta titles, descriptions, and keyword clusters.",
    icon: Search,
    iconName: "Search",
    category: "marketing",
    href: "/tools/seo-generator",
    systemPrompt: `${baseWriter} You are an SEO strategist.`,
    fields: [
      { name: "page", label: "Page / product", type: "text", required: true },
      { name: "keywords", label: "Target keywords", type: "text", required: true },
      { name: "competitors", label: "Competitors (optional)", type: "textarea" },
    ],
    buildPrompt: (v) =>
      `Create SEO package for: ${v.page}\nKeywords: ${v.keywords}\nCompetitors: ${v.competitors ?? "N/A"}\nOutput: meta title (60 chars), meta description (155 chars), H1, 5 H2 ideas, FAQ schema questions, internal link suggestions.`,
  },
  {
    id: "social-caption",
    name: "Social Caption Generator",
    description: "Platform-ready captions with hooks and hashtags.",
    icon: Camera,
    iconName: "Camera",
    category: "marketing",
    href: "/tools/social-caption",
    systemPrompt: `${baseWriter} You write viral social captions.`,
    fields: [
      { name: "platform", label: "Platform", type: "select", options: ["Instagram", "LinkedIn", "X", "TikTok"] },
      { name: "topic", label: "Topic", type: "text", required: true },
      { name: "brand", label: "Brand voice", type: "text" },
    ],
    buildPrompt: (v) =>
      `Write 3 caption variants for ${v.platform} about: ${v.topic}. Brand: ${v.brand ?? "professional"}. Include hooks, emojis where appropriate, and hashtags.`,
  },
  {
    id: "email-generator",
    name: "Email Generator",
    description: "Cold outreach, newsletters, and lifecycle emails.",
    icon: Mail,
    iconName: "Mail",
    category: "marketing",
    href: "/tools/email-generator",
    systemPrompt: `${baseWriter} You write high-converting emails.`,
    fields: [
      { name: "type", label: "Email type", type: "select", options: ["Cold outreach", "Newsletter", "Welcome", "Sales"] },
      { name: "goal", label: "Goal", type: "text", required: true },
      { name: "audience", label: "Audience", type: "text" },
    ],
    buildPrompt: (v) =>
      `Write a ${v.type} email. Goal: ${v.goal}. Audience: ${v.audience ?? "general"}. Include subject lines (3 options), preview text, and body.`,
  },
  {
    id: "product-description",
    name: "Product Description",
    description: "E-commerce and SaaS product copy.",
    icon: Package,
    iconName: "Package",
    category: "business",
    href: "/tools/product-description",
    systemPrompt: `${baseWriter} You write persuasive product copy.`,
    fields: [
      { name: "product", label: "Product name", type: "text", required: true },
      { name: "features", label: "Key features", type: "textarea", required: true },
      { name: "audience", label: "Ideal customer", type: "text" },
    ],
    buildPrompt: (v) =>
      `Write product description for ${v.product}.\nFeatures:\n${v.features}\nCustomer: ${v.audience ?? "general"}\nInclude headline, bullets, benefits, and CTA.`,
  },
  {
    id: "youtube-script",
    name: "YouTube Script",
    description: "Hook-driven scripts with retention beats.",
    icon: Video,
    iconName: "Video",
    category: "content",
    href: "/tools/youtube-script",
    systemPrompt: `${baseWriter} You write YouTube scripts optimized for retention.`,
    fields: [
      { name: "topic", label: "Video topic", type: "text", required: true },
      { name: "duration", label: "Target length", type: "select", options: ["Short (60s)", "Medium (5-8 min)", "Long (15+ min)"] },
      { name: "style", label: "Style", type: "select", options: ["Educational", "Entertainment", "Review", "Tutorial"] },
    ],
    buildPrompt: (v) =>
      `Write a YouTube script: ${v.topic}. Length: ${v.duration}. Style: ${v.style}. Include hook (0-30s), chapters, pattern interrupts, and CTA.`,
  },
  {
    id: "resume-generator",
    name: "Resume Builder",
    description: "ATS-friendly resumes and cover letter bullets.",
    icon: Briefcase,
    iconName: "Briefcase",
    category: "business",
    href: "/tools/resume-generator",
    systemPrompt: `${baseWriter} You write ATS-optimized resumes.`,
    fields: [
      { name: "role", label: "Target role", type: "text", required: true },
      { name: "experience", label: "Experience summary", type: "textarea", required: true },
      { name: "skills", label: "Skills", type: "text" },
    ],
    buildPrompt: (v) =>
      `Create resume content for ${v.role}.\nExperience:\n${v.experience}\nSkills: ${v.skills ?? ""}\nOutput: summary, experience bullets (STAR), skills section.`,
  },
  {
    id: "idea-generator",
    name: "Idea Generator",
    description: "Brainstorm content, product, and campaign ideas.",
    icon: Lightbulb,
    iconName: "Lightbulb",
    category: "creative",
    href: "/tools/idea-generator",
    systemPrompt: `${baseWriter} You are a creative strategist.`,
    fields: [
      { name: "niche", label: "Niche / industry", type: "text", required: true },
      { name: "goal", label: "Goal", type: "select", options: ["Content", "Product", "Campaign", "Growth"] },
    ],
    buildPrompt: (v) =>
      `Generate 15 ${v.goal} ideas for ${v.niche}. For each: title, angle, why it works, difficulty (1-5).`,
  },
  {
    id: "marketing-copy",
    name: "Marketing Copy",
    description: "Landing pages, ads, and value propositions.",
    icon: Megaphone,
    iconName: "Megaphone",
    category: "marketing",
    href: "/tools/marketing-copy",
    systemPrompt: `${baseWriter} You write conversion-focused marketing copy.`,
    fields: [
      { name: "product", label: "Product / offer", type: "text", required: true },
      { name: "audience", label: "Audience", type: "text", required: true },
      { name: "channel", label: "Channel", type: "select", options: ["Landing page", "Google Ads", "Facebook Ads", "LinkedIn"] },
    ],
    buildPrompt: (v) =>
      `Write ${v.channel} copy for ${v.product}. Audience: ${v.audience}. Include headline, subhead, 3 value props, social proof placeholder, CTA.`,
  },
  {
    id: "business-assistant",
    name: "Business Assistant",
    description: "Strategy, ops, and decision support.",
    icon: Bot,
    iconName: "Bot",
    category: "business",
    href: "/tools/business-assistant",
    systemPrompt: `${baseWriter} You are a senior business advisor.`,
    fields: [
      { name: "question", label: "Business question", type: "textarea", required: true },
      { name: "context", label: "Context", type: "textarea" },
    ],
    buildPrompt: (v) =>
      `Question: ${v.question}\nContext: ${v.context ?? "none"}\nProvide structured analysis: situation, options, recommendation, risks, next steps.`,
  },
];

export function getToolById(id: string): AITool | undefined {
  return aiTools.find((t) => t.id === id);
}

export function getToolByHref(href: string): AITool | undefined {
  return aiTools.find((t) => t.href === href);
}
