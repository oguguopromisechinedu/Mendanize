# MES-043 Completion Handoff — Learner Messaging

**Status:** Complete (MVP)  
**Date:** 2026-07-28  
**Spec:** [docs/engineering/MES-043.md](./engineering/MES-043.md)  
**Dependencies held:** MES-002 Notification/Audit, MES-006/030 dual-auth, MES-024 prefs, MES-036/039 context hooks (optional jobApplicationId/contractId on threads)

## Delivered

### Data
- Migration `20260728210000_mes043_learner_messaging`
- Models: `MessageThread`, `MessageThreadParticipant`, `ThreadMessage` (Ask AI keeps `Message`), `MessageReport`, `UserBlock`

### Service
- [`services/messaging/`](../services/messaging/) — start/reuse 1:1 threads, send, 5-minute recall, mute, block/unblock, report, admin resolve; in-app notify via MES-024 `dispatch` (respects mute + prefs)

### Learner UI (`PublicUser` only)
- `/account/messages` inbox + compose by email (deep-link `?userId=` supported)
- `/account/messages/[threadId]` thread view (send, recall, report, mute, optional image URL)

### Admin moderation
- `/dashboard/community/messages` report queue (resolve & hide / dismiss)
- Nav: Growth → Message reports; link from Community admin
- No Admin impersonation / “login as” path

## Dual-auth confirmation
DMs require `requirePublicUser`. Staff use `/dashboard/community/messages` for reports only.

## Explicitly out of scope
WebSocket presence/typing, voice/video, E2E encryption theater, Slack-style team channels with Admin roles.

## STOP

MES-043 complete. Next when approved: **MES-044 Coding Workspace Execution Engine**.
