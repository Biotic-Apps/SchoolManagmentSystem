package com.schoolapp.core.model.fees

/** `GET /dashboard/finance`; [collectionRate] is 0–100. */
data class FinanceOverview(
    val billedMinor: Long,
    val collectedMinor: Long,
    val outstandingMinor: Long,
    val overdueMinor: Long,
    val collectionRate: Double,
    val expensesMinor: Long,
    val payrollMinor: Long,
    val todayCollectedMinor: Long,
)
