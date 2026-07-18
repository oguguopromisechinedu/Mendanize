# MES-005 Premium Homepage — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-006 — Authentication & User Management](./engineering/MES-006.md) |
| **Do not start** | MES-007+ until MES-006 is done |

## Route conflict fixed

Removed legacy `app/learn/*` so `/learn` is owned only by `app/(public)/learn` (MES-004 shell).

## What was built

| Piece | Location |
|-------|----------|
| Homepage composition | `features/homepage-public/components/homepage-view.tsx` |
| 12 section components | `features/homepage-public/components/*-section.tsx` |
| CMS-shaped seed content | `features/homepage-public/constants/seed.ts` |
| Feature loader | `features/homepage-public/services/service.ts` |
| Content Service accessor | `services/content/homepage.ts` → `getHomepageContent()` |
| Public page | `app/(public)/page.tsx` |
| Public API | `GET /api/public/homepage` |

## Sections (order/visibility driven by payload)

1. Premium hero (brand-led, ink/amber atmosphere, CTAs, trust line)  
2. Ask Mendanize (Tier-1 UI only)  
3. Platform statistics (animated placeholders)  
4. Featured categories  
5. Learning paths  
6. Featured articles  
7. Featured AI tools  
8. Why Mendanize  
9. Testimonials  
10. Newsletter (disabled placeholder)  
11. FAQ accordion  
12. Final CTA  

## CMS readiness

Section `id` / `visible` / `order` live on the content payload. Spec mentions MES-012 for homepage CMS; **MES-INDEX maps Homepage CMS to MES-013** (`features/homepage-management`) — use that for admin editing next.

Ask widget AI wiring is deferred (MES-INDEX: Ask = MES-019; this MEStext referenced MES-018).

## STOP

Ready for **MES-006**.
