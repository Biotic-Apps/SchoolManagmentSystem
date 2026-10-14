package com.schoolapp.feature.fees.staff.structure

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.fees.structure.FeeHead
import com.schoolapp.core.model.fees.structure.FeeHeadKind
import com.schoolapp.core.model.fees.structure.FeePlan
import com.schoolapp.core.model.fees.structure.SiblingDiscount
import com.schoolapp.core.model.organisation.AcademicSession

enum class HeadIssue { CODE, NAME }

@Immutable
data class HeadForm(
    val code: String = "",
    val name: String = "",
    val kind: FeeHeadKind = FeeHeadKind.RECURRING,
    val refundable: Boolean = false,
    val issues: Set<HeadIssue> = emptySet(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    fun validate(): Set<HeadIssue> = buildSet {
        if (!Regex("^[A-Za-z0-9_-]{2,30}$").matches(code.trim())) add(HeadIssue.CODE)
        if (name.trim().length !in 2..100) add(HeadIssue.NAME)
    }
}

/** Add ([editing] null) or change one sibling discount rule. */
@Immutable
data class SiblingForm(
    val editing: SiblingDiscount? = null,
    val childIndex: Int = 2,
    val percent: String = "",
    val percentInvalid: Boolean = false,
    val childTaken: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    fun percentValue(): Int? = percent.trim().toIntOrNull()?.takeIf { it in 1..100 }
}

sealed interface StructureConfirm {
    data class Approve(val plan: FeePlan) : StructureConfirm
    data class Archive(val plan: FeePlan) : StructureConfirm
    data class DeleteSibling(val discount: SiblingDiscount) : StructureConfirm
}

enum class StructureNotice { HEAD_ADDED, PLAN_APPROVED, PLAN_ARCHIVED, SIBLING_ADDED, SIBLING_UPDATED, SIBLING_REMOVED }

@Immutable
data class FeeStructureUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val heads: List<FeeHead> = emptyList(),
    val sessions: List<AcademicSession> = emptyList(),
    val sessionId: String? = null,
    val plans: List<FeePlan>? = null,
    val plansLoading: Boolean = false,
    val plansError: AppError? = null,
    val discounts: List<SiblingDiscount> = emptyList(),
    val headForm: HeadForm? = null,
    val siblingForm: SiblingForm? = null,
    val confirm: StructureConfirm? = null,
    val busy: Boolean = false,
    val notice: StructureNotice? = null,
    val actionError: AppError? = null,
)
