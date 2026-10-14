package com.schoolapp.core.model.fees.structure

enum class FeeHeadKind { RECURRING, ONE_TIME }

enum class FeeFrequency { MONTHLY, QUARTERLY, TERM, YEARLY, ONCE }

enum class FeePlanStatus { DRAFT, APPROVED, ARCHIVED }

data class FeeHead(
    val id: String,
    val code: String,
    val name: String,
    val kind: FeeHeadKind,
    val refundable: Boolean,
    /** Billed automatically (activities, store); never part of a plan. */
    val system: Boolean,
)

data class FeeHeadInput(val schoolId: String, val code: String, val name: String, val kind: FeeHeadKind, val refundable: Boolean)

data class FeePlanItem(val feeHeadId: String, val feeHeadName: String, val amountMinor: Long, val frequency: FeeFrequency, val dueDay: Int)

data class LateFee(val amountMinor: Long, val afterDays: Int)

data class FeePlan(
    val id: String,
    val classId: String,
    val className: String,
    val name: String,
    val status: FeePlanStatus,
    val items: List<FeePlanItem>,
    val lateFee: LateFee?,
) {
    /** What a month costs from MONTHLY items. */
    val monthlyMinor: Long get() = items.filter { it.frequency == FeeFrequency.MONTHLY }.sumOf { it.amountMinor }
}

data class FeePlanInput(
    val branchId: String,
    val sessionId: String,
    val classId: String,
    val name: String,
    val items: List<FeePlanItem>,
    val lateFee: LateFee?,
)

data class SiblingDiscount(val id: String, val childIndex: Int, val percentOff: Int)
