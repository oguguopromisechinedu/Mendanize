-- Homepage CMS design fields (hero accents, stat icons, featured styling, latest articles)
ALTER TABLE "Homepage" ADD COLUMN IF NOT EXISTS "latestArticlesJson" JSONB;

ALTER TABLE "HomepageHero" ADD COLUMN IF NOT EXISTS "eyebrow" TEXT;
ALTER TABLE "HomepageHero" ADD COLUMN IF NOT EXISTS "headlineAccent" TEXT;
ALTER TABLE "HomepageHero" ADD COLUMN IF NOT EXISTS "showAskInHero" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "HomepageStatistic" ADD COLUMN IF NOT EXISTS "icon" TEXT;

ALTER TABLE "HomepageFeaturedContent" ADD COLUMN IF NOT EXISTS "icon" TEXT;
ALTER TABLE "HomepageFeaturedContent" ADD COLUMN IF NOT EXISTS "iconColor" TEXT;
