# Transactional email templates (MES-024)

Canonical keys and content live in `EmailTemplate` via `services/notification`.

Keys used by Auth (MES-006): `welcome`, `password_reset`, `email_verification`.

SMTP delivery is intentionally placeholder — dispatches create `CommunicationLog` rows with status `queued`.
