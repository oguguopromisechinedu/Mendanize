# Mendanize Ecosystem


| Field            | Value                           |
| ---------------- | ------------------------------- |
| **Version**      | 1.1.0                           |
| **Status**       | Approved                        |
| **Last Updated** | 2026-07-28                      |
| **Owner**        | Mendanize Platform Architecture |


## Purpose

Define the high-level ecosystem of Mendanize across Public Website, Learner Account, Admin Dashboard, API surfaces, and shared platform services.

## Ecosystem Surfaces


| Surface         | Audience      | Core URL Space                      | Primary Responsibility                         |
| --------------- | ------------- | ----------------------------------- | ---------------------------------------------- |
| Public Website  | Visitors      | `/` + public pages                  | Discovery, marketing, SEO, onboarding          |
| Learner Account | `PublicUser`  | `/account/*`                        | Learning, profile, marketplace participation   |
| Admin Dashboard | `Admin`       | `/dashboard/*`                      | Operations, moderation, publishing, governance |
| API Layer       | UI + services | `/api/public/*`, `/api/dashboard/*` | Role-bound data access                         |




## Surface Map



### Public Marketing Experience (Before Authentication)

- Homepage
- Learn / Guides / AI Tools
- Blog / Search / Categories
- Pricing / About / Contact
- Sign In / Create Account



### Public User Workspace (After Authentication)

- Dashboard / Learn / Courses
- AI Tutor / Coding Workspace / Projects
- Prompt Library / AI Tools / AI Tools Marketplace
- Certificates / Community / Career Hub
- Work Marketplace / Messages / Notifications
- My Spaces / AI Assistant / Search / User Profile



### Super Admin Dashboard (Platform Control Center)

```text
SUPER ADMIN DASHBOARD
├── Overview
├── Public Marketing Experience
│   ├── Homepage
│   ├── Navigation
│   ├── Articles
│   ├── Guides
│   ├── AI Tools
│   ├── Videos
│   ├── Collections
│   ├── Roadmaps
│   ├── Newsletters
│   ├── SEO
│   └── Pages
├── Public User Workspace
│   ├── Dashboard
│   ├── Learn
│   ├── Courses
│   ├── AI Tutor
│   ├── Coding Workspace
│   ├── Projects
│   ├── Prompt Library
│   ├── AI Tools
│   ├── AI Tools Marketplace
│   ├── Community
│   ├── Career Hub
│   ├── Work Marketplace
│   ├── Certificates
│   ├── Messages
│   └── Notifications
├── Platform Services
│   ├── Users
│   ├── Roles & Permissions
│   ├── AI Providers
│   ├── Payments
│   ├── APIs
│   ├── Storage
│   ├── Analytics
│   ├── Monitoring
│   ├── Logs
│   └── Settings
└── System
    ├── Security
    ├── Backups
    ├── Integrations
    └── Environment
```

- Controls, monitors, configures, and publishes all platform domains.
- Centralizes moderation, governance, and operational visibility.
- Keeps public and learner experiences managed from one control center.



## Core Platform Services

- Authentication and authorization
- User, role, and permission management
- AI services
- Learning services
- Marketplace services
- Community services
- Messaging services
- Notification services
- Search and recommendation services
- Analytics services
- Payment services
- Certificate services
- Media and file storage services
- API gateway and integration services



## Data and Infrastructure

- PostgreSQL database
- Cache layer
- Object storage
- Background jobs and queues
- CDN
- Monitoring and logging
- Audit trail
- Backup and recovery
- Security layer



## Architectural Principles

1. **Dual-auth boundary (MES-030):**
  - Learners stay in `/account/*`.
  - Admin workflows stay in `/dashboard/*`.
2. **Single source of truth per domain:**
  - Domain behavior lives under `services/*`, consumed by feature modules.
3. **Role-aware links and navigation:**
  - Public-user links must not route into admin-only surfaces, and vice versa.
4. **Moderated publication pipeline:**
  - Draft/review/publish states are enforced in admin-controlled workflows.
5. **Published-only public reads:**
  - Public and learner discovery surfaces read published records only.



## Route Ownership Model

- Public route groups: `app/(public)`
- Learner route groups: `app/(account)/account`
- Admin route groups: `app/(dashboard)/dashboard`
- Shared API handlers: `app/api/public`, `app/api/dashboard`

See [App Router Paths](./App-Router-Paths.md) for detailed URL-to-folder mapping rules.

## Cross-Domain Integrations

- **AI Tools Catalog + Marketplace:** Admin-curated catalog and creator-submitted tools coexist through source labels and approval gates.
- **Organization + Hiring:** Company profiles and hiring live under learner account, while moderation remains in dashboard.
- **Homepage + Analytics:** Public-facing sections and metrics are governed through admin-controlled content and settings.  
**Architectural Principle**
  Mendanize is a single ecosystem composed of two user experiences:
  1. The **Public Marketing Experience**, which introduces and promotes the platform before authentication.
  2. The **Public User Workspace**, which provides personalized learning, building, collaboration, and earning experiences after authentication.
  Both experiences are powered by the same backend services, share the same data architecture, and are fully managed from the Super Admin Dashboard. No public-facing experience shall implement independent management logic or become a separate system outside the centralized platform architecture.



## Related Documents

- [App Router Paths](./App-Router-Paths.md)
- [Module Map](./Module-Map.md)
- [Dependency Map](./Dependency-Map.md)
- [MES-030](../engineering/MES-030.md)

