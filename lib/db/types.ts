/** Database entity types — map to Prisma/Drizzle/Supabase when connected */

export type UserId = string;

export type GeneratedBlog = {
  id: string;
  userId: UserId;
  topic: string;
  tone: string;
  audience: string;
  content: string;
  seoScore?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SavedDraft = {
  id: string;
  userId: UserId;
  title: string;
  content: string;
  status: "draft" | "published" | "archived";
  createdAt: Date;
  updatedAt: Date;
};

export type ContentTemplate = {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  category: string;
};

export type UsageRecord = {
  userId: UserId;
  generationsThisMonth: number;
  plan: "free" | "pro" | "team";
  resetAt: Date;
};
