export type ActionResult = {
  ok: boolean;
  message: string;
};

export const CONTENT_TYPE_OPTIONS = [
  { value: "article", label: "Articles" },
  { value: "guide", label: "Guides" },
  { value: "ai_tool", label: "AI Tools" },
  { value: "category", label: "Categories" },
  { value: "topic", label: "Topics" },
] as const;

export const DIFFICULTY_OPTIONS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;
