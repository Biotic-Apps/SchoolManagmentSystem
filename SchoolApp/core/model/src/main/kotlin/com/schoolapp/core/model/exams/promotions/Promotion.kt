package com.schoolapp.core.model.exams.promotions

import com.schoolapp.core.model.common.PersonRef

enum class PromotionDecision { PROMOTE, REPEAT, CONDITIONAL, GRADUATE }

enum class PromotionStatus { SUGGESTED, CONFIRMED, APPLIED }

/** One student's end-of-session decision (suggested from published exams, possibly overridden). */
data class PromotionRow(
    val id: String,
    val student: PersonRef,
    val fromClass: PersonRef?,
    val fromSection: PersonRef?,
    val toClass: PersonRef?,
    val toSection: PersonRef?,
    val percent: Double?,
    val failedSubjects: Int,
    val suggested: PromotionDecision,
    val decision: PromotionDecision,
    val status: PromotionStatus,
    val reason: String?,
    val overridden: Boolean,
)

/** Result of `POST /promotions/apply`. */
data class PromotionApplyResult(val applied: Int, val skipped: Int)
