import { designTokensToStyleBlock } from "@/lib/design-tokens-css";
import { getDesignTokens } from "@/services/settings";

export async function DesignTokensStyle() {
  const tokens = await getDesignTokens();
  const css = designTokensToStyleBlock(tokens);
  return (
    <style
      id="mendanize-design-tokens"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
