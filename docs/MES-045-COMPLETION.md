# MES-045 Completion Handoff — Community Events & Learning Calendar

**Status:** Complete (MVP)  
**Date:** 2026-07-29  
**Spec:** [docs/engineering/MES-045.md](./engineering/MES-045.md)  
**Dependencies held:** MES-002 Notification/Search, MES-006/030, MES-024 prefs, MES-036 Community surfaces, MES-039 optional Challenge link

## Delivered

### Data
- Migration `20260729010000_mes045_community_events`
- `CommunityEvent` (title, slug, description, cover, start/end, timezone, location type, join URL, capacity, status, optional `challengeId`)
- `EventRsvp` with `remindedAt` for reminder idempotency

### Services
- [`services/community-events/`](../services/community-events/) — CRUD, RSVP, capacity, 24h reminder dispatch (in-app + email via MES-024)
- Community home + `searchCommunity` index published events

### Surfaces
- `/community/events` list · `/community/events/[slug]` detail + RSVP
- `/dashboard/community/events` Admin create/publish/cancel + send reminders
- Community nav + home “Upcoming events”

## Dual-auth / moderation
RSVP is `PublicUser` only. Create/publish is Admin dashboard (`requireEditor`). Community Moderator flag still does not grant `/dashboard/*`.

## Explicitly out of scope
Built-in video, paid tickets, RRULE series, multi-track conference CMS.

## STOP

MES-045 complete. Search indexes events. Next when approved: **MES-046 Affiliate & Referral Tracking**.
