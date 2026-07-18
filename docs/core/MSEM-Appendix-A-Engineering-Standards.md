# MSEM Appendix A — Engineering Standards

**Version:** 1.0  
**Applies to:** every MES specification, MES-001 onward.

---

## PURPOSE

Every MES spec previously repeated the same Accessibility, Responsive Design, Performance, SEO, and Code Quality sections verbatim. That duplication is a drift risk — one spec says "Core Web Vitals," another doesn't, though both should hold the same bar.

This appendix is the single source of truth for these standards. Every MES spec references this appendix instead of restating it. If a module needs an exception or addition, it states the exception explicitly — silence means "standard applies as written here."

---

## ACCESSIBILITY STANDARD

Every user-facing surface (public or dashboard) must:

- Use semantic HTML — correct landmark elements, no div-soup where a native element exists.
- Support full keyboard navigation — every interactive element reachable and operable without a mouse.
- Maintain visible focus states — never suppressed via CSS.
- Use ARIA labels where semantic HTML alone is insufficient (custom components, icon-only buttons).
- Maintain proper heading hierarchy — no skipped levels, one H1 per page.
- Be screen-reader compatible — verified with actual screen reader testing, not just markup inspection, before a module is considered complete.
- Meet WCAG 2.1 AA color contrast minimums.
- Provide accessible error/validation messaging tied to the relevant form field (not color-only, not a disconnected toast).
- Use ARIA live regions for dynamically streamed or updated content (e.g. Ask Mendanize AI responses, real-time status).

---

## RESPONSIVE DESIGN STANDARD

Every surface must work at:

- Mobile (< 640px)
- Tablet (640–1024px)
- Laptop (1024–1440px)
- Desktop (1440–1920px)
- Ultra-wide (> 1920px) — content should not stretch to illegible line lengths; cap container width.

No feature may be desktop-only. Any interaction pattern that doesn't translate directly to touch (drag-and-drop, hover-reveal) must have an explicit touch/keyboard fallback stated in that module's spec.

---

## PERFORMANCE STANDARD

- Prefer Server Components; justify any Client Component boundary.
- Lazy-load below-the-fold content and non-critical images.
- Code-split by route; avoid large shared bundles.
- Optimize images (correct format, sizing, lazy loading) and font loading (avoid layout shift).
- Target good Core Web Vitals (LCP, INP, CLS) on every public-facing page — this is not optional for "just the homepage," it applies platform-wide.
- Dashboard pages optimize for perceived speed (skeleton states, optimistic UI) over raw Lighthouse score, since they're behind auth and not SEO-relevant.

---

## SEO STANDARD (public surfaces only)

Every public page must support:

- Unique meta title and description (via the SEO system — see Shared Services spec).
- Canonical URL.
- Open Graph and Twitter Card metadata.
- Structured data appropriate to content type (Article, HowTo/Guide, Product for AI Tools, Breadcrumb).
- Clean, human-readable URL slugs.
- Proper internal linking (related content, breadcrumbs) — no orphaned pages.

Dashboard pages are `noindex` by default and exempt from this standard.

---

## CODE QUALITY STANDARD

- Strong TypeScript — no implicit `any`, no unnecessary type assertions.
- Modular, reusable components — no copy-pasted component variants; extend or compose instead.
- Consistent naming conventions across the codebase (established once, not per-module).
- No duplicated business logic — if two modules need the same behavior, it lives in a shared service (see Shared Services spec), not copied twice.
- No dead code or commented-out blocks left in place.
- Every module must build with zero TypeScript, lint, or build errors before being considered complete — this is a hard gate, not a preference.

---

## SECURITY BASELINE (every module, not just the final audit)

Every module that touches user data, auth, or writes must implement — at build time, not deferred to a later audit:

- Input validation on every form and API boundary.
- Output sanitization for any user-generated or rich-text content (article bodies, AI chat messages).
- Authorization checks at the data layer, not just hidden UI — a locked-down UI is not access control.
- Secure session handling per the Authentication module's session contract (see MES-006) — no module invents its own session logic.
- No secrets or internal identifiers exposed to the client.
- Rate-limit-aware design on any endpoint that accepts user input at volume (search, AI chat, forms) — the enforcement mechanism may be built later, but the code should be structured so a rate limiter can be added without refactoring.

MES-028 (Production Readiness) audits adherence to this baseline — it does not introduce security as a new concept at that stage.

---

## TESTING BASELINE

From the first module onward (not deferred to the end of the sequence):

- Every shared UI component (Button, Card, Modal, etc.) gets a basic render/interaction test at the time it's built.
- Every data model gets a basic integrity test (required fields, relationship constraints) at the time it's built.
- Full test suite expansion (integration, E2E, accessibility, performance regression) is formalized in MES-029, but the scaffolding and the habit start in MES-002.

---

## HOW MODULE SPECS REFERENCE THIS APPENDIX

Every MES module spec's standards sections are replaced with a single line:

> "Follows MSEM Appendix A — Engineering Standards (Accessibility, Responsive, Performance, SEO, Code Quality, Security Baseline, Testing Baseline). Exceptions, if any, are stated below."

Any module with a genuine deviation (e.g. Dashboard pages being SEO-exempt) states that deviation explicitly in its own spec rather than silently contradicting the appendix.

## Related Documents

- [MSEM](./MSEM.md)
- [Project Rules](./Project-Rules.md)
- [MES Index](../engineering/MES-INDEX.md)
