/**
 * Public search API — MES-017.
 */
import { handleApiError } from "@/lib/api/errors"
import { ok } from "@/lib/api/response"
import { clientKeyFromRequest } from "@/lib/observability"
import { enforceRateLimit } from "@/lib/rate-limit"
import * as searchService from "@/services/search"
import { parseSearchParams } from "@/validators"
import { publicSearchQuerySchema } from "@/validators/search"
import { z } from "zod"

const discoverySchema = z.object({
  mode: z.literal("discovery").optional(),
  prefix: z.string().max(120).optional(),
})

const expandedSchema = publicSearchQuerySchema.extend({
  mode: z.string().optional(),
  types: z.string().optional(),
  category: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  featured: z.string().optional(),
  recentlyUpdated: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  prefix: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    await enforceRateLimit(clientKeyFromRequest(req, "search-public"), 60)

    const url = new URL(req.url)
    if (url.searchParams.get("mode") === "discovery") {
      const parsed = discoverySchema.safeParse({
        mode: "discovery",
        prefix: url.searchParams.get("prefix") ?? undefined,
      })
      const data = await searchService.getSearchDiscovery(
        parsed.success ? parsed.data.prefix ?? "" : "",
      )
      return ok(data)
    }

    const params = parseSearchParams(req.url, expandedSchema)
    const types = params.types
      ? (params.types.split(",").map((t) => t.trim()).filter(Boolean) as Array<
          "article" | "guide" | "ai_tool" | "category" | "topic"
        >)
      : undefined

    const data = await searchService.search({
      query: params.q,
      page: params.page,
      pageSize: params.pageSize,
      types,
      categorySlug: params.category,
      topicSlug: params.topic,
      difficulty: params.difficulty,
      featured:
        params.featured === "1" || params.featured === "true"
          ? true
          : params.featured === "0" || params.featured === "false"
            ? false
            : undefined,
      recentlyUpdated:
        params.recentlyUpdated === "1" || params.recentlyUpdated === "true"
          ? true
          : undefined,
      publishedAfter: params.from,
      publishedBefore: params.to,
    })
    return ok(data)
  } catch (error) {
    return handleApiError(error)
  }
}
