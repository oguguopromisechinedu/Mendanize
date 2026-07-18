# MES-019 Ask Mendanize AI — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-020 — Platform Settings](./engineering/MES-020.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/ask-mendanize` |
| AI calls | `services/ai` (`ask.ts` → `generateText` mock path) |
| Related panel | `services/recommendations` (no ad hoc ranking) |
| AI config | Links to `/dashboard/settings` only — **no** local settings module |
| Migration | `20260715250000_mes019_ask` |

## Models

`Conversation`, `Message`, `MessageRole`, `AskPromptTemplate`, `AskFeedback`, `AskHandoff`

## Tiers

| Tier | Surface | Behavior |
|------|---------|----------|
| **1** | `AskContextualWidget` on public Article/Guide/Tool (+ homepage Ask) | Anonymous, single-turn, ephemeral; creates `AskHandoff` |
| **2** | `/dashboard/ask` | Auth-gated history, templates, multi-turn, feedback |
| **Handoff** | Sign-in → `/dashboard/ask?handoff=` | Claims handoff into a persisted conversation |

## APIs

- `POST /api/public/ask` — Tier 1
- `GET /api/dashboard/ask` — Tier 2 dashboard payload

## Out of scope (as specified)

Live provider routing, usage/billing gates, real moderation.

## STOP

Ready for **MES-020**. Do not start Platform Settings until requested.
