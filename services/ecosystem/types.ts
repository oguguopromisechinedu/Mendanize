import type { GuideDifficulty } from "@prisma/client";

/** Mirrors the CatalogPublishStatus Prisma enum (added in learner-admin-ecosystem migration). */
export type CatalogPublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/** Mirrors the LearnerProjectStatus Prisma enum (added in learner-admin-ecosystem migration). */
export type LearnerProjectStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "COMPLETED";

// ── Prompt Packs ──────────────────────────────────────────────────────────────

export type PromptPackItemRecord = {
  id: string;
  packId: string;
  title: string;
  prompt: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PromptPackRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  status: CatalogPublishStatus;
  sortOrder: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: PromptPackItemRecord[];
  _count?: { items: number };
};

// ── Project Templates ─────────────────────────────────────────────────────────

export type ProjectTemplateRecord = {
  id: string;
  title: string;
  slug: string;
  brief: string;
  difficulty: GuideDifficulty;
  guideIds: string[];
  toolIds: string[];
  status: CatalogPublishStatus;
  estimatedHours: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LearnerProjectRecord = {
  id: string;
  publicUserId: string;
  templateId: string;
  status: LearnerProjectStatus;
  notes: string | null;
  startedAt: Date;
  completedAt: Date | null;
  updatedAt: Date;
  template: ProjectTemplateRecord;
};

// ── Certificates ──────────────────────────────────────────────────────────────

export type CertificateTemplateRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  guideId: string;
  badgeUrl: string | null;
  status: CatalogPublishStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CertificateRecord = {
  id: string;
  publicUserId: string;
  templateId: string;
  guideId: string;
  credentialCode: string;
  issuedAt: Date;
  template: CertificateTemplateRecord;
};

// ── Featured Learning ─────────────────────────────────────────────────────────

export type FeaturedSettingRecord = {
  id: string;
  key: string;
  featuredGuideIds: string[];
  featuredArticleIds: string[];
  featuredToolIds: string[];
  featuredPromptPackIds: string[];
  featuredProjectIds: string[];
  updatedAt: Date;
};

// ── Workspace Presets ─────────────────────────────────────────────────────────

export type WorkspacePresetRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  guideId: string | null;
  starterPrompt: string | null;
  challengeNote: string | null;
  status: CatalogPublishStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// ── Community Posts ───────────────────────────────────────────────────────────

export type CommunityPostRecord = {
  id: string;
  publicUserId: string | null;
  entityType: string;
  entityId: string;
  body: string;
  status: string;
  createdAt: Date;
  authorName: string | null;
};

// ── Write inputs ──────────────────────────────────────────────────────────────

export type CreatePromptPackInput = {
  title: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  sortOrder?: number;
};

export type UpdatePromptPackInput = Partial<CreatePromptPackInput>;

export type CreatePromptPackItemInput = {
  title: string;
  prompt: string;
  sortOrder?: number;
};

export type UpdatePromptPackItemInput = Partial<CreatePromptPackItemInput>;

export type CreateProjectTemplateInput = {
  title: string;
  slug: string;
  brief: string;
  difficulty?: GuideDifficulty;
  guideIds?: string[];
  toolIds?: string[];
  estimatedHours?: number;
};

export type UpdateProjectTemplateInput = Partial<CreateProjectTemplateInput>;

export type CreateCertificateTemplateInput = {
  title: string;
  slug: string;
  description?: string | null;
  guideId: string;
  badgeUrl?: string | null;
};

export type UpdateCertificateTemplateInput = Partial<CreateCertificateTemplateInput>;

export type UpdateFeaturedSettingInput = {
  featuredGuideIds?: string[];
  featuredArticleIds?: string[];
  featuredToolIds?: string[];
  featuredPromptPackIds?: string[];
  featuredProjectIds?: string[];
};

export type CreateWorkspacePresetInput = {
  title: string;
  slug: string;
  description?: string | null;
  guideId?: string | null;
  starterPrompt?: string | null;
  challengeNote?: string | null;
};

export type UpdateWorkspacePresetInput = Partial<CreateWorkspacePresetInput>;

export type CreateCommunityPostInput = {
  publicUserId: string;
  entityType: "GUIDE" | "PROJECT";
  entityId: string;
  body: string;
};

export type UpdateLearnerProjectInput = {
  status?: LearnerProjectStatus;
  notes?: string | null;
};
