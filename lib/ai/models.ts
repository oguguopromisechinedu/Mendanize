export type AIModel = {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
};

export const aiModels: AIModel[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Fast, cost-efficient — great for most tasks",
    maxTokens: 4096,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Higher quality for complex reasoning",
    maxTokens: 8192,
  },
];

export const DEFAULT_MODEL = "gpt-4o-mini";

export function getModelById(id: string): AIModel | undefined {
  return aiModels.find((m) => m.id === id);
}
