package com.schoolapp.feature.timetable.substitutions

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.timetable.OverrideInput

/** One substitution as listed: class, period, who covers and who is away. */
@Immutable
data class SubstitutionItem(
    val id: String,
    val classLabel: String?,
    val periodIndex: Int,
    /** "Period N" ordinal from the bell schedule; null when the schedule is unknown. */
    val periodNumber: Int?,
    val timeRange: String?,
    val substitute: String?,
    val originalTeacher: String?,
    val reason: String?,
)

/** A teaching period the form can pick on the chosen date (breaks can't be covered). */
@Immutable
data class PeriodChoice(val index: Int, val number: Int?, val timeRange: String)

enum class SubstitutionNotice { ASSIGNED, REMOVED }

/** "Assign substitute" sheet; errors show once [showErrors] is set by a submit attempt. */
@Immutable
data class SubstituteForm(
    val date: String,
    val sectionId: String? = null,
    val periodIndex: Int? = null,
    val teacherId: String? = null,
    val reason: String = "",
    val showErrors: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val reasonInvalid: Boolean get() = reason.trim().length !in REASON_MIN..REASON_MAX
    val isValid: Boolean get() = sectionId != null && periodIndex != null && teacherId != null && !reasonInvalid

    /** The request, or null while something is missing or the reason is too short/long. */
    fun toInput(): OverrideInput? {
        if (reasonInvalid) return null
        val section = sectionId ?: return null
        val period = periodIndex ?: return null
        val teacher = teacherId ?: return null
        return OverrideInput(section, date, period, teacher, reason.trim())
    }

    companion object {
        const val REASON_MIN = 3
        const val REASON_MAX = 300
    }
}

/**
 * Substitutions for supervisors. [available] once the session is a supervisor role with `timetable.view`;
 * [canEdit] (`timetable.edit`) adds "Assign substitute" and remove.
 */
@Immutable
data class SubstitutionsUiState(
    val available: Boolean = false,
    val canEdit: Boolean = false,
    val date: String = "",
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val items: List<SubstitutionItem> = emptyList(),
    val sections: List<SwitcherOption> = emptyList(),
    val teachers: List<SwitcherOption> = emptyList(),
    /** Teaching periods on the form's date. */
    val periods: List<PeriodChoice> = emptyList(),
    val form: SubstituteForm? = null,
    /** Substitution waiting for the remove confirmation. */
    val removing: SubstitutionItem? = null,
    val isRemoving: Boolean = false,
    val actionError: AppError? = null,
    val notice: SubstitutionNotice? = null,
)
