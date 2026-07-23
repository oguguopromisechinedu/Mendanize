# MES-031 Completion Handoff — AI Knowledge Generation Pipeline

| Field | Value |
|-------|-------|
| **Spec** | [MES-031](./engineering/MES-031.md) |
| **Status** | Complete (MVP) |
| **Date** | 2026-07-23 |

## Pipeline

1. Ask Tier-1 (`services/ai/ask.ts`) searches existing knowledge via Search service.
2. If hits exist → answer is grounded with those titles/links.
3. If no hits → `enqueueKnowledgeGeneration` creates `AIGenerationJob` (anonymized fingerprint only — **never** `PublicUser.id`).
4. Job processor creates `Article` with status **`AI_DRAFT`** (never auto-publishes).
5. Near-duplicate published titles → job marked `MERGED` with `DuplicateCandidate` rows instead of a redundant draft.
6. Admins review in **AI Knowledge Center** (`/dashboard/ai-knowledge`) and open the existing Article Editor.

## Boundary confirmation

No PublicUser session can list or open AI Drafts / the Knowledge Center. Dashboard remains Admin-gated.

## Models

`AIGenerationJob`, `DuplicateCandidate`, `ArticleStatus.AI_DRAFT` (+ migration `20260723000000_mes031_035_pipeline_privacy_logs`).

## STOP

Pipeline summarized; one-way boundary holds. Ready for MES-032 verification in sequence.
