"use client"

import type { SeoFieldsValue } from "@/services/seo/types"
import { AdminPanel } from "@/features/admin-dashboard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

/**
 * Reusable SEO fields panel — shared by Article, Guide, Tool, Category editors.
 */
export function SeoFieldsPanel({
  value,
  onChange,
  showSlug = false,
  showSocialImage = true,
  description = "Via SEO Service (MES-015) — shared across content types.",
}: {
  value: SeoFieldsValue
  onChange: (patch: Partial<SeoFieldsValue>) => void
  showSlug?: boolean
  showSocialImage?: boolean
  description?: string
}) {
  return (
    <AdminPanel title="SEO" description={description}>
      <div className="space-y-3">
        {showSlug ? (
          <div className="space-y-1.5">
            <Label htmlFor="seo-slug">Slug</Label>
            <Input
              id="seo-slug"
              value={value.slug ?? ""}
              onChange={(e) => onChange({ slug: e.target.value })}
            />
          </div>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="seoTitle">SEO title</Label>
          <Input
            id="seoTitle"
            value={value.seoTitle ?? ""}
            onChange={(e) => onChange({ seoTitle: e.target.value })}
            maxLength={70}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seoDescription">Meta description</Label>
          <Textarea
            id="seoDescription"
            value={value.seoDescription ?? ""}
            onChange={(e) => onChange({ seoDescription: e.target.value })}
            rows={3}
            maxLength={160}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="focusKeyword">Focus keyword</Label>
          <Input
            id="focusKeyword"
            value={value.focusKeyword ?? ""}
            onChange={(e) => onChange({ focusKeyword: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="canonicalUrl">Canonical URL</Label>
          <Input
            id="canonicalUrl"
            value={value.canonicalUrl ?? ""}
            onChange={(e) => onChange({ canonicalUrl: e.target.value })}
            placeholder="https://…"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ogTitle">OG title</Label>
          <Input
            id="ogTitle"
            value={value.ogTitle ?? ""}
            onChange={(e) => onChange({ ogTitle: e.target.value })}
            placeholder="Defaults to SEO title"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ogDescription">OG description</Label>
          <Textarea
            id="ogDescription"
            value={value.ogDescription ?? ""}
            onChange={(e) => onChange({ ogDescription: e.target.value })}
            rows={2}
            placeholder="Defaults to meta description"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ogImageUrl">OG image URL</Label>
          <Input
            id="ogImageUrl"
            value={value.ogImageUrl ?? value.socialImageUrl ?? ""}
            onChange={(e) =>
              onChange({
                ogImageUrl: e.target.value,
                socialImageUrl: e.target.value,
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="twitterTitle">Twitter title</Label>
          <Input
            id="twitterTitle"
            value={value.twitterTitle ?? ""}
            onChange={(e) => onChange({ twitterTitle: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="twitterImageUrl">Twitter image URL</Label>
          <Input
            id="twitterImageUrl"
            value={value.twitterImageUrl ?? ""}
            onChange={(e) => onChange({ twitterImageUrl: e.target.value })}
          />
        </div>
        {showSocialImage ? (
          <div className="space-y-1.5">
            <Label htmlFor="socialImageUrl">Social image URL</Label>
            <Input
              id="socialImageUrl"
              value={value.socialImageUrl ?? ""}
              onChange={(e) => onChange({ socialImageUrl: e.target.value })}
            />
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <Label htmlFor="robotsIndex">Robots index</Label>
          <Switch
            id="robotsIndex"
            checked={value.robotsIndex ?? true}
            onCheckedChange={(v) => onChange({ robotsIndex: Boolean(v) })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="robotsFollow">Robots follow</Label>
          <Switch
            id="robotsFollow"
            checked={value.robotsFollow ?? true}
            onCheckedChange={(v) => onChange({ robotsFollow: Boolean(v) })}
          />
        </div>
      </div>
    </AdminPanel>
  )
}
