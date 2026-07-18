/** Ask Mendanize types (MES-019). */

export type AskContextTypeValue =
  | "ARTICLE"
  | "GUIDE"
  | "AI_TOOL"
  | "GENERAL"
  | "HOMEPAGE";

/** public = learner-facing site; admin = CMS / dashboard assistant */
export type AskSurfaceValue = "public" | "admin";

export type MessageRoleValue = "USER" | "ASSISTANT" | "SYSTEM";

export type AskMessageRecord = {
  id: string;
  role: MessageRoleValue;
  content: string;
  model: string | null;
  createdAt: string;
};

export type AskConversationRecord = {
  id: string;
  title: string;
  contextType: AskContextTypeValue;
  contextId: string | null;
  contextTitle: string | null;
  handoffId: string | null;
  updatedAt: string;
  createdAt: string;
  messages: AskMessageRecord[];
};

export type AskPromptTemplateRecord = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  promptText: string;
};

export type AskTier1Request = {
  question: string;
  contextType: AskContextTypeValue;
  contextId?: string | null;
  contextTitle?: string | null;
  contextExcerpt?: string | null;
  /** Defaults to public. Admin Ask never uses live frontend catalog content. */
  surface?: AskSurfaceValue;
};

export type AskTier1Result = {
  answer: string;
  model: string;
  placeholder: boolean;
  handoffId: string;
  images: Array<{
    url: string;
    alt: string;
    model: string;
    placeholder: boolean;
  }>;
  providers: {
    text: "anthropic" | "openai" | "local_mock";
    image: "openai" | "local_mock" | "none";
  };
  related: Array<{
    title: string;
    href: string;
    reason?: string;
  }>;
};

export type AskDashboardPayload = {
  conversations: Array<
    Pick<
      AskConversationRecord,
      "id" | "title" | "updatedAt" | "contextType" | "contextTitle"
    >
  >;
  active: AskConversationRecord | null;
  templates: AskPromptTemplateRecord[];
  suggestions: string[];
  aiSettingsHref: string;
  surface: AskSurfaceValue;
};
