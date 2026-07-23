# Project Understanding Report

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved (audit output) |
| **Date** | 2026-07-19 |
| **Method** | Evidence-based (source of truth: code + specs; completion docs treated as unverified claims) |
| **Scope** | MSEM, Appendix A, MES-001 → MES-029, architecture + standards docs, full repository |

> **Premise correction:** The `v1.0` label in the repository refers to the **engineering specification version**, not implementation status. `docs/MES-XXX-COMPLETION.md` files are treated as claims to be verified, not evidence.

---

## 1. What Mendanize is

An **AI-powered technology-learning platform** (explicitly *not* a CMS, blog, social network, marketplace, or generic chatbot). Only administrators / authorized staff publish educational content.

Two surfaces share Shared Services but keep separate routing, layout, and permission boundaries:

- **Teaching Frontend** (`app/(public)`) — public Learn / Discover / Explore.
- **Dashboard** (`app/(dashboard)`) — auth-gated Practice / Ask / Create / Administer.
- Auth flows live in `app/(auth)`.

Five product pillars: **Learn, Discover, Practice, Explore, Ask.**

## 2. Governance hierarchy

`MSEM` (manifesto) → `MSEM Appendix A` (binding standards: Accessibility, Responsive, Performance, SEO, Code Quality, Security Baseline, Testing Baseline) → 29 `MES` specs → architecture maps (`Module-Map`, `Dependency-Map`, `App-Router-Paths`) + standards contracts (`API`, `Coding`, `Database`, `Security`, `UI`, `Component`, `Testing`). Documentation-first is the declared governing rule.

## 3. Architecture (verified in code)

Layered, dependencies flow inward:

```
app/*  →  features/*  →  services/*  →  (repositories/*)  →  lib/ + prisma  →  PostgreSQL
```

Confirmed invariants:

- `{ data, error, meta }` API envelope — `lib/api/response.ts`.
- Single session contract — `features/authentication` (`getSession`), enforced by `NO_SESSION.md` markers.
- Single AI-config owner — `services/settings/ai-config.ts`.
- Single recommendations engine — `services/recommendations`.
- Navigation-driven public layout; runtime design tokens.

## 4. Technology stack (verified)

Next.js 16 (App Router), React 19, TypeScript, Prisma 7 + `@prisma/adapter-pg` (PostgreSQL/Supabase), NextAuth v5 (Credentials + Google/GitHub, JWT), Stripe (live SDK), OpenAI + Anthropic (live SDK/fetch), Upstash rate-limit (in-memory fallback), Zod, TipTap, Tailwind 4 / shadcn.

## 5. Dependency spine

`MSEM → Appendix A → MES-001 → 002 → 003 → {004,005,006} → 007 → content(008–016) → platform(017–021) → UX(022–024) → public(025–027) → launch(028–029)`.

Deferral contracts: AI-config consumers → MES-020; related-content consumers → MES-018; dashboards → MES-006/007.

## 6. Overall shape

~754 TS/TSX files, 21 feature modules, 13 shared services, 119 Prisma models / 43 enums / 21 migrations.

**Conclusion:** A substantial, coherent, genuinely-wired application — not scaffolding — but **not production-complete**: several core capabilities are deliberately placeholder (see Repository Audit and Gap Analysis reports).
