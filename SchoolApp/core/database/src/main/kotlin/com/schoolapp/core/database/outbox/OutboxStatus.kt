package com.schoolapp.core.database.outbox

enum class OutboxStatus {
    PENDING,
    IN_FLIGHT,
    NEEDS_ATTENTION,
}
