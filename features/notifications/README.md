# notifications

**Implements:** MES-024

**Shared Service:** `services/notification` only — Auth, Billing, content, and learning must call `dispatch()`, not reinvent messaging.
