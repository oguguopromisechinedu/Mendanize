/**
 * Centralized prompt management for Mendanize
 */

export const systemPrompts = {
  workspace: `You are Mendanize AI — a premium assistant for creators and businesses.
Be concise, actionable, and professional. Use markdown for structure.
When writing code, use fenced code blocks with language tags.`,

  toolDefault: `You are Mendanize — a premium AI assistant for creators and teams.
Deliver production-ready output. Use markdown when it improves readability.`,
} as const;

export function interpolateTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? "");
}
