# MES-053 Completion Handoff — Work Marketplace Lifecycle

| Field | Value |
|-------|-------|
| **Spec** | [MES-053](./engineering/MES-053.md) |
| **Phases** | **A + B** implemented |
| **Status** | Implemented — awaiting approval |
| **Date** | 2026-07-30 |

## Phase A

- Continuation contracts, Maintenance & Support panel, tasks, Hire Again
- Migration: `20260730020000_mes053_work_lifecycle_maintenance`

## Phase B

- Plan catalog: Basic ($99) / Standard ($249) / Premium ($499)
- `MaintenanceSubscription` + `MaintenanceSubscriptionPayment`
- Connect destination subscriptions + `application_fee_percent` from WORK commission rule
- Webhook handling branched in MES-021 route by `metadata.rail = mes053_retainer` (logic lives in `services/marketplace/retainers.ts` — Checkout sync skipped)
- Cancel at period end; PAST_DUE notifications
- Tasks may be `coveredByRetainer`
- Finance overview: retainer gross / fees / active / past-due counts
- Migration: `20260730030000_mes053_phase_b_retainers`

## Confirm

1. Completed PROJECT rows stay immutable  
2. Retainer money never uses MES-021 Checkout helpers  
3. No new session type  

## STOP

Wait for approval before SLA/hour-banking work.
