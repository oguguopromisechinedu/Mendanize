-- MES-016 Navigation Manager

CREATE TYPE "MenuItemType" AS ENUM ('INTERNAL_PAGE', 'ARTICLE', 'CATEGORY', 'TOPIC', 'GUIDE', 'AI_TOOL', 'CUSTOM_URL');
CREATE TYPE "MenuLocationKey" AS ENUM ('MAIN', 'MOBILE', 'FOOTER', 'UTILITY', 'QUICK_LINKS');

CREATE TABLE "NavigationSiteSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'main',
    "brandName" TEXT NOT NULL DEFAULT 'Mendanize',
    "brandHref" TEXT NOT NULL DEFAULT '/',
    "brandTagline" TEXT,
    "signInHref" TEXT NOT NULL DEFAULT '/sign-in',
    "copyrightText" TEXT,
    "newsletterEnabled" BOOLEAN NOT NULL DEFAULT true,
    "newsletterHeadline" TEXT,
    "newsletterPlaceholder" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NavigationSiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NavigationSiteSettings_key_key" ON "NavigationSiteSettings"("key");

CREATE TABLE "NavigationMenu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "maxDepth" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NavigationMenu_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NavigationMenu_slug_key" ON "NavigationMenu"("slug");

CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "parentId" TEXT,
    "label" TEXT NOT NULL,
    "itemType" "MenuItemType" NOT NULL DEFAULT 'INTERNAL_PAGE',
    "href" TEXT,
    "entityId" TEXT,
    "icon" TEXT,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "badgeLabel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MenuItem_menuId_sortOrder_idx" ON "MenuItem"("menuId", "sortOrder");
CREATE INDEX "MenuItem_parentId_idx" ON "MenuItem"("parentId");

CREATE TABLE "MenuLocation" (
    "id" TEXT NOT NULL,
    "key" "MenuLocationKey" NOT NULL,
    "label" TEXT NOT NULL,
    "menuId" TEXT,
    "columnTitle" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MenuLocation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MenuLocation_key_key" ON "MenuLocation"("key");
CREATE INDEX "MenuLocation_key_sortOrder_idx" ON "MenuLocation"("key", "sortOrder");

CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "icon" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SocialLink_sortOrder_idx" ON "SocialLink"("sortOrder");

CREATE TABLE "LegalLink" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LegalLink_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LegalLink_sortOrder_idx" ON "LegalLink"("sortOrder");

ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "NavigationMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MenuLocation" ADD CONSTRAINT "MenuLocation_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "NavigationMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;
