# Security Standards

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-14 |
| **Owner** | Mendanize Platform Architecture |


## Purpose

Establish security requirements for authentication, authorization, data protection, abuse prevention, and secure AI/tool usage across Mendanize.


## Scope

All surfaces, APIs, server actions, webhooks, media uploads, and third-party integrations (Stripe, AI providers, OAuth).


## Dependencies

- [MES-006-Authentication.md](../engineering/MES-006.md)
- [MES-020-Platform-Settings.md](../engineering/MES-020.md)
- [MES-021-Billing-Subscriptions.md](../engineering/MES-021.md)
- [ENVIRONMENT.md](../ENVIRONMENT.md)


## Controls

| Control | Requirement |
|---------|-------------|
| Authentication | Single session contract (MES-006); secure cookies; CSRF protections as provided by Auth.js |
| Authorization | Role checks on every dashboard API/action; deny by default |
| Secrets | Env/secret manager only; never commit; never return to clients |
| Validation | Zod (or equivalent) on all writes |
| Rate limiting | Auth, AI, search, webhooks |
| Uploads | MIME allowlist, size caps, private buckets by default |
| Webhooks | Signature verification (Stripe) |
| AI | Prompt injection awareness; do not execute tool actions without authZ; no secret leakage in model context |
| Logging | No passwords, tokens, or full card data in logs |


## Implementation Notes

- Prefer server-only modules for provider SDKs.
- Sanitize markdown/HTML before render when user-generated.
- Content Security Policy and secure headers configured at the edge/platform.
- Principle of least privilege for service roles and DB users.


## Related Documents

- [Authentication](../engineering/MES-006.md)
- [API Standards](./API-Standards.md)
- [Production Readiness](../engineering/MES-028.md)
