-- MES-040 / marketplace catalog: extend Tool for hybrid AI Tools Marketplace
ALTER TABLE "Tool" ADD COLUMN IF NOT EXISTS "documentationUrl" TEXT;
ALTER TABLE "Tool" ADD COLUMN IF NOT EXISTS "aiCapabilities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Tool" ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tool" ADD COLUMN IF NOT EXISTS "source" "MarketplaceListingSource" NOT NULL DEFAULT 'THIRD_PARTY';

CREATE INDEX IF NOT EXISTS "Tool_verified_idx" ON "Tool"("verified");
CREATE INDEX IF NOT EXISTS "Tool_source_idx" ON "Tool"("source");
