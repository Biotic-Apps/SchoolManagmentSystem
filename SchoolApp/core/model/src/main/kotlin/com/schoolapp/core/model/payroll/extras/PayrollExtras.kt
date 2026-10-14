package com.schoolapp.core.model.payroll.extras

enum class OvertimeStatus { PENDING, APPROVED, REJECTED }

enum class OvertimeSource { ATTENDANCE, MANUAL }

data class OvertimeEntry(
    val id: String,
    val staffId: String,
    val staffName: String,
    val designation: String?,
    /** `YYYY-MM-DD`. */
    val date: String,
    val minutes: Int,
    val source: OvertimeSource,
    val status: OvertimeStatus,
    val reason: String?,
    /** `HH:mm` check-out time for entries found in attendance. */
    val checkOut: String?,
    val decidedBy: String?,
)

data class OvertimeMonth(
    val items: List<OvertimeEntry>,
    val pendingCount: Int,
    val approvedMinutes: Int,
    val staffLeavesAt: String?,
    val overtimeEnabled: Boolean,
    /** The month's payroll is approved; overtime can no longer change. */
    val locked: Boolean,
)

data class OvertimeInput(val staffId: String, val date: String, val minutes: Int, val reason: String)

enum class AdjustmentKind(val adds: Boolean) { BONUS(true), ARREAR(true), DEDUCTION(false), ADVANCE(false), FINE(false) }

enum class AdjustmentStatus { PENDING, APPLIED, CANCELLED }

data class PayrollAdjustment(
    val id: String,
    val staffId: String,
    val staffName: String,
    val month: String,
    val kind: AdjustmentKind,
    val amountMinor: Long,
    val reason: String,
    val status: AdjustmentStatus,
    val cancelReason: String?,
)

data class AdjustmentInput(val staffId: String, val month: String, val kind: AdjustmentKind, val amountMinor: Long, val reason: String)
