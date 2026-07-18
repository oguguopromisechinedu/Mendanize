/** Content Shared Service types (MES-002 / MES-008). */

export type ContentListParams = {
  page?: number;
  pageSize?: number;
  query?: string;
  categorySlug?: string;
  topicSlug?: string;
  categoryId?: string;
  topicId?: string;
};

export type ArticleStatusValue =
  | "DRAFT"
  | "REVIEW"
  | "SCHEDULED"
  | "PUBLISHED"
  | "ARCHIVED";

export type ArticleSortField =
  | "updatedAt"
  | "publishedAt"
  | "title"
  | "readingTimeMin";

export type ArticleAdminListParams = {
  page?: number;
  pageSize?: number;
  query?: string;
  status?: ArticleStatusValue | "ALL";
  categoryId?: string;
  topicId?: string;
  featured?: boolean;
  sort?: ArticleSortField;
  sortDir?: "asc" | "desc";
};

export type ArticleSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  readingTimeMin?: number;
  categoryName?: string | null;
  featuredImageUrl?: string | null;
  featured?: boolean;
};

export type PublicArticleDetail = ArticleRecord & {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

export type ArticleTagSummary = {
  id: string;
  name: string;
  slug: string;
};

export type ArticleRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: ArticleStatusValue;
  featured: boolean;
  readingTimeMin: number;
  authorId: string;
  authorName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  topicId: string | null;
  topicName: string | null;
  topicSlug: string | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  viewCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  socialImageUrl: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  tags: ArticleTagSummary[];
  createdAt: string;
  updatedAt: string;
};

export type ArticleListResult = {
  items: ArticleRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type ArticleWriteInput = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content: string;
  status?: ArticleStatusValue;
  featured?: boolean;
  categoryId?: string | null;
  topicId?: string | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  socialImageUrl?: string | null;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  tagNames?: string[];
  authorId: string;
};

export type GuideStatusValue =
  | "DRAFT"
  | "REVIEW"
  | "SCHEDULED"
  | "PUBLISHED"
  | "ARCHIVED";

export type GuideDifficultyValue = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type GuideSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  difficulty?: GuideDifficultyValue;
  estimatedMinutes?: number;
  coverImageUrl?: string | null;
  categoryName?: string | null;
  featured?: boolean;
  sectionCount?: number;
  lessonCount?: number;
};

export type GuideLessonRecord = {
  id: string;
  sectionId: string;
  title: string;
  slug: string;
  content: string;
  readingTimeMin: number;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  videoUrl: string | null;
  codeExample: string | null;
  resourceUrl: string | null;
  articleId: string | null;
  aiToolId: string | null;
  sortOrder: number;
};

export type GuideSectionRecord = {
  id: string;
  guideId: string;
  title: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  lessons: GuideLessonRecord[];
};

export type GuideRecord = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  status: GuideStatusValue;
  difficulty: GuideDifficultyValue;
  estimatedMinutes: number;
  learningObjectives: string[];
  prerequisites: string[];
  featured: boolean;
  authorId: string;
  authorName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  topicId: string;
  topicName: string | null;
  topicSlug: string | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  sectionCount: number;
  lessonCount: number;
  sections: GuideSectionRecord[];
  createdAt: string;
  updatedAt: string;
};

export type GuideListParams = {
  page?: number;
  pageSize?: number;
  query?: string;
  status?: GuideStatusValue | "ALL";
  categoryId?: string;
  topicId?: string;
  difficulty?: GuideDifficultyValue | "ALL";
  sort?: "updatedAt" | "title" | "estimatedMinutes";
  sortDir?: "asc" | "desc";
};

export type GuideListResult = {
  items: GuideRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type GuideWriteInput = {
  title: string;
  slug?: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  status?: GuideStatusValue;
  difficulty?: GuideDifficultyValue;
  estimatedMinutes?: number;
  learningObjectives?: string[];
  prerequisites?: string[];
  featured?: boolean;
  categoryId?: string | null;
  topicId: string;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  authorId: string;
  sections?: Array<{
    id?: string;
    title: string;
    slug?: string;
    description?: string | null;
    sortOrder?: number;
    lessons?: Array<{
      id?: string;
      title: string;
      slug?: string;
      content?: string;
      readingTimeMin?: number;
      featuredImageUrl?: string | null;
      featuredImageAlt?: string | null;
      videoUrl?: string | null;
      codeExample?: string | null;
      resourceUrl?: string | null;
      articleId?: string | null;
      aiToolId?: string | null;
      sortOrder?: number;
    }>;
  }>;
};

export type ToolStatusValue =
  | "DRAFT"
  | "REVIEW"
  | "SCHEDULED"
  | "PUBLISHED"
  | "ARCHIVED";

export type ToolPricingValue = "FREE" | "FREEMIUM" | "PAID" | "ENTERPRISE";
export type ToolDifficultyValue = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type ToolAvailabilityValue =
  | "AVAILABLE"
  | "BETA"
  | "WAITLIST"
  | "DISCONTINUED";
export type ToolFeatureKindValue =
  | "FEATURE"
  | "USE_CASE"
  | "ADVANTAGE"
  | "LIMITATION";
export type ToolImageKindValue = "LOGO" | "COVER" | "SCREENSHOT";

export type ToolSummary = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  pricing?: ToolPricingValue;
  difficulty?: ToolDifficultyValue;
  logoUrl?: string | null;
  featured?: boolean;
  categoryNames?: string[];
  topicNames?: string[];
  platforms?: string[];
  publishedAt?: string | null;
};

export type ToolFeatureRecord = {
  id: string;
  label: string;
  kind: ToolFeatureKindValue;
  sortOrder: number;
};

export type ToolImageRecord = {
  id: string;
  url: string;
  alt: string | null;
  kind: ToolImageKindValue;
  sortOrder: number;
};

export type ToolRecord = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  websiteUrl: string | null;
  developer: string | null;
  platforms: string[];
  availability: ToolAvailabilityValue;
  pricing: ToolPricingValue;
  difficulty: ToolDifficultyValue;
  recommendedFor: string[];
  learningOutcomes: string[];
  relatedArticleIds: string[];
  relatedGuideIds: string[];
  relatedToolIds: string[];
  demoVideoUrl: string | null;
  featured: boolean;
  status: ToolStatusValue;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  categoryIds: string[];
  categoryNames: string[];
  topicIds: string[];
  topicNames: string[];
  tagNames: string[];
  features: ToolFeatureRecord[];
  images: ToolImageRecord[];
  logoUrl: string | null;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ToolListParams = {
  page?: number;
  pageSize?: number;
  query?: string;
  status?: ToolStatusValue | "ALL";
  pricing?: ToolPricingValue | "ALL";
  difficulty?: ToolDifficultyValue | "ALL";
  platform?: string;
  categoryId?: string;
  topicId?: string;
  featured?: boolean;
  sort?: "updatedAt" | "name" | "pricing" | "publishedAt";
  sortDir?: "asc" | "desc";
};

export type ToolListResult = {
  items: ToolRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type ToolWriteInput = {
  name: string;
  slug?: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  websiteUrl?: string | null;
  developer?: string | null;
  platforms?: string[];
  availability?: ToolAvailabilityValue;
  pricing?: ToolPricingValue;
  difficulty?: ToolDifficultyValue;
  recommendedFor?: string[];
  learningOutcomes?: string[];
  relatedArticleIds?: string[];
  relatedGuideIds?: string[];
  relatedToolIds?: string[];
  demoVideoUrl?: string | null;
  featured?: boolean;
  status?: ToolStatusValue;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  categoryIds?: string[];
  topicIds?: string[];
  tagNames?: string[];
  features?: Array<{
    id?: string;
    label: string;
    kind: ToolFeatureKindValue;
    sortOrder?: number;
  }>;
  images?: Array<{
    id?: string;
    url: string;
    alt?: string | null;
    kind: ToolImageKindValue;
    sortOrder?: number;
  }>;
  logoUrl?: string | null;
  coverUrl?: string | null;
  screenshotUrls?: string[];
};

export type CategorySummary = {
  id: string;
  slug: string;
  name: string;
};

export type TopicSummary = {
  id: string;
  slug: string;
  name: string;
  categoryId?: string | null;
};

export type AuthorSummary = {
  id: string;
  name: string;
  slug?: string;
};

export type TagSummary = {
  id: string;
  slug: string;
  name: string;
};

export type TaxonomyStatusValue = "DRAFT" | "ACTIVE" | "HIDDEN" | "ARCHIVED";

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  accentColor: string | null;
  status: TaxonomyStatusValue;
  featured: boolean;
  displayOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  topicCount: number;
  articleCount: number;
  guideCount: number;
  toolCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TopicRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  categoryName: string | null;
  status: TaxonomyStatusValue;
  featured: boolean;
  displayOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  articleCount: number;
  guideCount: number;
  toolCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryListParams = {
  page?: number;
  pageSize?: number;
  query?: string;
  status?: TaxonomyStatusValue | "ALL";
  sort?: "displayOrder" | "name" | "updatedAt";
  sortDir?: "asc" | "desc";
};

export type TopicListParams = {
  page?: number;
  pageSize?: number;
  query?: string;
  categoryId?: string;
  status?: TaxonomyStatusValue | "ALL";
  sort?: "displayOrder" | "name" | "updatedAt";
  sortDir?: "asc" | "desc";
};

export type CategoryListResult = {
  items: CategoryRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type TopicListResult = {
  items: TopicRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type CategoryWriteInput = {
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  accentColor?: string | null;
  status?: TaxonomyStatusValue;
  featured?: boolean;
  displayOrder?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export type TopicWriteInput = {
  name: string;
  slug?: string;
  description?: string | null;
  categoryId: string;
  status?: TaxonomyStatusValue;
  featured?: boolean;
  displayOrder?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export type CategoryDetail = CategoryRecord & {
  topics: TopicRecord[];
  recentArticles: Array<{ id: string; title: string; slug: string; status: string }>;
};

export type TopicDetail = TopicRecord & {
  recentArticles: Array<{ id: string; title: string; slug: string; status: string }>;
};

/** Homepage CMS (MES-013) */

export type HomepageStatusValue = "DRAFT" | "PUBLISHED";
export type HomepageFeaturedKindValue =
  | "CATEGORY"
  | "ARTICLE"
  | "GUIDE"
  | "TOOL";
export type HomepageSelectionModeValue = "MANUAL" | "AUTOMATIC";

export type HomepageSectionRecord = {
  id: string;
  sectionKey: string;
  enabled: boolean;
  sortOrder: number;
  visibilityRules: string | null;
  backgroundStyle: string | null;
  animationEnabled: boolean;
  spacing: string;
  title: string | null;
  displayLimit: number | null;
};

export type HomepageHeroRecord = {
  brand: string;
  headline: string;
  supportingText: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  trustLine: string | null;
  heroImageUrl: string | null;
  backgroundGradient: string | null;
  askPlaceholder: string | null;
  eyebrow: string | null;
  headlineAccent: string | null;
  showAskInHero: boolean;
};

export type HomepageStatisticRecord = {
  id: string;
  key: string;
  label: string;
  value: string;
  sortOrder: number;
  icon: string | null;
};

export type HomepageFaqRecord = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
};

export type HomepageCtaRecord = {
  headline: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export type HomepageFeaturedRecord = {
  id: string;
  kind: HomepageFeaturedKindValue;
  entityId: string;
  sortOrder: number;
  selectionMode: HomepageSelectionModeValue;
  titleOverride: string | null;
  icon: string | null;
  iconColor: string | null;
};

export type HomepageTestimonialRecord = {
  id: string;
  quote: string;
  name: string;
  role: string;
  sortOrder: number;
};

export type HomepageAskRecord = {
  title: string;
  description: string;
  placeholder: string;
  suggestions: string[];
};

export type HomepageWhyItemRecord = {
  id: string;
  title: string;
  description: string;
  icon?: string | null;
};

export type HomepageNewsletterRecord = {
  headline: string;
  description: string;
  privacy: string;
  placeholder: string;
  ctaLabel: string;
  socialProof?: string | null;
};

export type HomepageLatestArticlesRecord = {
  mode: "AUTOMATIC" | "MANUAL";
  articleIds: string[];
  limit: number;
};

export type HomepageAdminRecord = {
  id: string;
  key: string;
  status: HomepageStatusValue;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  sections: HomepageSectionRecord[];
  hero: HomepageHeroRecord;
  statistics: HomepageStatisticRecord[];
  faqs: HomepageFaqRecord[];
  cta: HomepageCtaRecord;
  featured: HomepageFeaturedRecord[];
  testimonials: HomepageTestimonialRecord[];
  ask: HomepageAskRecord;
  why: HomepageWhyItemRecord[];
  newsletter: HomepageNewsletterRecord;
  latestArticles: HomepageLatestArticlesRecord;
  activeSectionCount: number;
  hiddenSectionCount: number;
};

export type HomepageSectionWrite = {
  sectionKey: string;
  enabled?: boolean;
  sortOrder?: number;
  visibilityRules?: string | null;
  backgroundStyle?: string | null;
  animationEnabled?: boolean;
  spacing?: string;
  title?: string | null;
  displayLimit?: number | null;
};

export type HomepageWriteInput = {
  status?: HomepageStatusValue;
  sections?: HomepageSectionWrite[];
  hero?: Partial<HomepageHeroRecord>;
  statistics?: Array<{
    id?: string;
    key: string;
    label: string;
    value: string;
    sortOrder?: number;
    icon?: string | null;
  }>;
  faqs?: Array<{
    id?: string;
    question: string;
    answer: string;
    sortOrder?: number;
  }>;
  cta?: Partial<HomepageCtaRecord>;
  featured?: Array<{
    id?: string;
    kind: HomepageFeaturedKindValue;
    entityId: string;
    sortOrder?: number;
    selectionMode?: HomepageSelectionModeValue;
    titleOverride?: string | null;
    icon?: string | null;
    iconColor?: string | null;
  }>;
  testimonials?: Array<{
    id?: string;
    quote: string;
    name: string;
    role: string;
    sortOrder?: number;
  }>;
  ask?: Partial<HomepageAskRecord>;
  why?: Array<{
    id?: string;
    title: string;
    description: string;
    icon?: string | null;
  }>;
  newsletter?: Partial<HomepageNewsletterRecord>;
  latestArticles?: Partial<HomepageLatestArticlesRecord>;
};
