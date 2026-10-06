package com.schoolapp.feature.attendance.leave

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.leave.LeaveType

/** Open "Request leave" sheet; [type] is null for a child's leave (staff pick a type). */
@Immutable
data class LeaveForm(
    val from: String,
    val to: String,
    val reason: String = "",
    val type: LeaveType? = null,
    val isSaving: Boolean = false,
    val fromMissing: Boolean = false,
    val toMissing: Boolean = false,
    val rangeInvalid: Boolean = false,
    val reasonMissing: Boolean = false,
    val error: AppError? = null,
) {
    val hasErrors: Boolean get() = fromMissing || toMissing || rangeInvalid || reasonMissing
}

object LeaveFormValidator {
    /** Flags every problem at once: dates required, from <= to, reason required. */
    fun validate(form: LeaveForm): LeaveForm {
        val fromMissing = form.from.isBlank()
        val toMissing = form.to.isBlank()
        return form.copy(
            fromMissing = fromMissing,
            toMissing = toMissing,
            rangeInvalid = !fromMissing && !toMissing && form.from > form.to,
            reasonMissing = form.reason.isBlank(),
        )
    }
}
