# No local recommendations

Recommendation logic lives only in `services/recommendations` (MES-018).
This feature may call that service; it must not reimplement ranking/affinity logic.
