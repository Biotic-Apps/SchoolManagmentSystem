package com.schoolapp.core.model.settings

/** School-wide policies (`/settings/policies`); branch settings still override per branch. */
data class PolicySettings(
    val attendanceLockTime: String,
    val diaryModeration: Boolean,
    val gradingDefault: String?,
    val lateFee: LateFeeDefault?,
    /** Request type (CONCESSION, REFUND, EXPENSE, PURCHASE_ORDER, …) to limit in minor units. */
    val approvalLimits: Map<String, Long>,
    val passwordMinLength: Int,
    val requireDigit: Boolean,
    val sessionTimeoutMinutes: Int,
    val twoFactorRequiredFor: List<String>,
)

data class LateFeeDefault(val amountMinor: Long, val afterDays: Int)

object ApprovalLimitTypes {
    const val CONCESSION = "CONCESSION"
    const val REFUND = "REFUND"
    const val EXPENSE = "EXPENSE"
    const val PURCHASE_ORDER = "PURCHASE_ORDER"
    val ALL = listOf(CONCESSION, REFUND, EXPENSE, PURCHASE_ORDER)
}
