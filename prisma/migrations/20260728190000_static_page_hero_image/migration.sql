-- Static pages: hero copy + featured image for public CMS rendering
ALTER TABLE "StaticPage" ADD COLUMN "hero" TEXT;
ALTER TABLE "StaticPage" ADD COLUMN "featuredImageUrl" TEXT;
ALTER TABLE "StaticPage" ADD COLUMN "featuredImageAlt" TEXT;
