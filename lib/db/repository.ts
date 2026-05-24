import type { GeneratedBlog, SavedDraft, UsageRecord } from "@/lib/db/types";

/**
 * Repository interface — implement with your database adapter.
 * Keeps UI and API routes decoupled from storage details.
 */
export interface ContentRepository {
  saveGeneration(blog: Omit<GeneratedBlog, "id" | "createdAt" | "updatedAt">): Promise<GeneratedBlog>;
  listGenerations(userId: string, limit?: number): Promise<GeneratedBlog[]>;
  saveDraft(draft: Omit<SavedDraft, "id" | "createdAt" | "updatedAt">): Promise<SavedDraft>;
  getUsage(userId: string): Promise<UsageRecord | null>;
}

/** In-memory stub until database is connected */
export const stubRepository: ContentRepository = {
  async saveGeneration() {
    throw new Error("Database not configured. Set up lib/db/repository implementation.");
  },
  async listGenerations() {
    return [];
  },
  async saveDraft() {
    throw new Error("Database not configured.");
  },
  async getUsage() {
    return null;
  },
};
