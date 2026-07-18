# API Standards

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Status** | Approved |
| **Last Updated** | 2026-07-14 |
| **Owner** | Mendanize Platform Architecture |


## Purpose

Define the single HTTP and server-action response contract for Mendanize APIs so clients and agents never invent divergent envelopes.


## Scope

`app/api/public/*`, `app/api/dashboard/*`, shared error codes, pagination meta, versioning policy, and alignment with server actions.


## Dependencies

- [MES-002-Shared-Services.md](../engineering/MES-002.md)
- [SECURITY-STANDARDS.md](./Security-Standards.md)
- [CODING-STANDARDS.md](./Coding-Standards.md)


## Response Contract

```ts
export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  meta?: Record<string, unknown>;
};
```

Canonical type: `types/api.ts`.

**Success:** `error` is `null`, `data` populated.  
**Failure:** `data` is `null`, `error` populated; HTTP status reflects class (400/401/403/404/409/422/429/500).


## Meta Conventions

| Key | Meaning |
|-----|---------|
| `meta.page`, `meta.pageSize`, `meta.total` | Pagination |
| `meta.requestId` | Correlation id |
| `meta.placeholder` | Scaffold-only endpoints (must be removed before launch) |


## Error Codes

Use stable uppercase codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`, `CONFLICT`, `NOT_IMPLEMENTED`, `INTERNAL_ERROR`. Validation details belong in `error.details`.


## Implementation Notes

- Public APIs never expose admin-only fields.
- Dashboard APIs require session + role checks before business logic.
- Prefer Shared Services inside handlers; keep route files thin.
- Server Actions should return an equivalent discriminated result shape for UI forms.


## Related Documents

- [Shared Services](../engineering/MES-002.md)
- [Security Standards](./Security-Standards.md)
- [Authentication](../engineering/MES-006.md)
