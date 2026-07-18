# user-learning

**Implements:** MES-022

**Shared Services:** `services/learning`, `services/recommendations`, `services/content`, `services/settings`

Authenticated learner space at `/learning`. Ranking always via MES-018 (`contextType: "user"`).
SavedArticle/Guide/AITool map to polymorphic `SavedContent`.
