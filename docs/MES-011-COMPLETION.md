# MES-011 Admin AI Studio — completion handoff

| Field | Value |
|-------|-------|
| **Completed** | 2026-07-15 |
| **Next** | [MES-012 — AI Tools Management](./engineering/MES-012.md) |

## Architecture

| Concern | Implementation |
|---------|----------------|
| Feature | `features/ai-studio` |
| AI Service | `services/ai` — `studio.ts` + provider status |
| Persistence | `AIGeneration` (+ type/provider/status enums) — migration `20260715170000_mes011_ai_studio` |
| Providers | OpenAI when `OPENAI_API_KEY` is set; otherwise **local mock** drafts/images |
| Video | Interface + history record only (`VIDEO_TBD`) |

## Surfaces

- **Home** — quick-start cards, recent generations, provider status
- **Generate Article** — topic/tone/length/taxonomy → streamed preview → editable TipTap → **Send to Article Editor**
- **Generate Image** — prompt/style/aspect → image grid → **Save to Media Library**
- **Generate Video** — request form records intent (no provider)
- **History** — search/filter by type; links to accepted articles

## Handoffs

| Destination | How |
|-------------|-----|
| **Article CMS (MES-008)** | Creates a `DRAFT` article with generated HTML and links `AIGeneration.articleId` |
| **Media Library (MES-014)** | `acceptGeneratedImage` queues an asset URL via Media Service and sets `mediaAssetId` |

## Distinct from Ask Mendanize AI

| | **AI Studio (MES-011)** | **Ask Mendanize (MES-019)** |
|--|-------------------------|----------------------------|
| Audience | Editors / admins | Learners |
| Purpose | Produce publishable drafts & assets | Answer questions / tutor |
| Output | Articles, images (video TBD) | Conversational answers |

Legacy workspace `Generation` model remains separate (tool/workspace history).

## STOP

Ready for **MES-012**. Do not start AI Tools Management until requested.
