import type {
  DesignColorTokens,
  DesignTokens,
} from "@/services/settings/design-tokens";

function colorBlock(colors: DesignColorTokens): string {
  const entries: Array<[string, string]> = [
    ["background", colors.background],
    ["foreground", colors.foreground],
    ["header", "#0A0B1E"],
    ["surface", colors.surface],
    ["card", colors.card],
    ["card-foreground", colors.foreground],
    ["popover", colors.card],
    ["popover-foreground", colors.foreground],
    ["primary", colors.primary],
    ["primary-foreground", colors.primaryForeground],
    ["secondary", colors.secondary],
    ["secondary-foreground", colors.secondaryForeground],
    ["muted", colors.muted],
    ["muted-foreground", colors.mutedForeground],
    ["accent", colors.accent],
    ["accent-foreground", colors.accentForeground],
    ["destructive", colors.error],
    ["success", colors.success],
    ["warning", colors.warning],
    ["border", colors.border],
    ["input", colors.border],
    ["ring", colors.focus],
    ["hover", colors.hover],
    ["sidebar", colors.surface],
    ["sidebar-foreground", colors.foreground],
    ["sidebar-primary", colors.primary],
    ["sidebar-primary-foreground", colors.primaryForeground],
    ["sidebar-accent", colors.muted],
    ["sidebar-accent-foreground", colors.foreground],
    ["sidebar-border", colors.border],
    ["sidebar-ring", colors.focus],
    ["chart-1", colors.primary],
    ["chart-2", colors.mutedForeground],
    ["chart-3", colors.secondary],
    ["chart-4", colors.muted],
    ["chart-5", colors.background],
  ];

  return entries.map(([key, value]) => `  --${key}: ${value};`).join("\n");
}

/** Inline CSS that applies Settings-backed design tokens at runtime (MES-003 / MES-020). */
export function designTokensToStyleBlock(tokens: DesignTokens): string {
  return `:root {\n${colorBlock(tokens.colorsLight)}\n}\n.dark {\n${colorBlock(tokens.colors)}\n}`;
}
