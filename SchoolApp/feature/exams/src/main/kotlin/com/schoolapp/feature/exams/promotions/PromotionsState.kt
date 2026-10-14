package com.schoolapp.feature.exams.promotions

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.promotions.PromotionDecision
import com.schoolapp.core.model.exams.promotions.PromotionRow
import com.schoolapp.core.model.exams.promotions.PromotionStatus
import com.schoolapp.core.model.organisation.AcademicSession

@Immutable
data class SuggestForm(
    val exams: List<Exam> = emptyList(),
    val examsLoading: Boolean = true,
    val examIds: Set<String> = emptySet(),
    val toMissing: Boolean = false,
    val examsMissing: Boolean = false,
    val running: Boolean = false,
    val error: AppError? = null,
)

@Immutable
data class OverrideForm(
    val row: PromotionRow,
    val decision: PromotionDecision = row.decision,
    val sectionId: String? = row.toSection?.id,
    val sections: List<PersonRef> = emptyList(),
    val reason: String = row.reason.orEmpty(),
    val reasonMissing: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val needsReason: Boolean get() = decision != row.suggested
}

@Immutable
data class ConfirmForm(val classId: String? = null, val isSaving: Boolean = false, val error: AppError? = null)

@Immutable
data class ApplyForm(val effectiveDate: String, val isSaving: Boolean = false, val error: AppError? = null)

sealed interface PromotionMessage {
    data object Suggested : PromotionMessage
    data object StillRunning : PromotionMessage
    data object Updated : PromotionMessage
    data class Confirmed(val count: Int) : PromotionMessage
    data class Applied(val applied: Int, val skipped: Int) : PromotionMessage
}

@Immutable
data class PromotionsState(
    val branchId: String? = null,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val sessions: List<AcademicSession> = emptyList(),
    val fromSessionId: String? = null,
    val toSessionId: String? = null,
    val rows: List<PromotionRow> = emptyList(),
    val classFilter: String? = null,
    val decisionFilter: PromotionDecision? = null,
    val canSuggest: Boolean = false,
    val isManager: Boolean = false,
    val suggest: SuggestForm? = null,
    val override: OverrideForm? = null,
    val confirm: ConfirmForm? = null,
    val apply: ApplyForm? = null,
    val message: PromotionMessage? = null,
) {
    val classes: List<PersonRef> get() = rows.mapNotNull { it.fromClass }.filter { it.id != null }.distinctBy { it.id }.sortedBy { it.name }

    val visible: List<PromotionRow>
        get() = rows.filter { (classFilter == null || it.fromClass?.id == classFilter) && (decisionFilter == null || it.decision == decisionFilter) }

    val suggestedCount: Int get() = rows.count { it.status == PromotionStatus.SUGGESTED }

    val confirmedCount: Int get() = rows.count { it.status == PromotionStatus.CONFIRMED }

    fun count(decision: PromotionDecision): Int = rows.count { it.decision == decision }
}
