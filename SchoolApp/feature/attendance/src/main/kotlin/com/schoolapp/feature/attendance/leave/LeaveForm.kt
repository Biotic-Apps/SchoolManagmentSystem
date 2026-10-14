package com.schoolapp.feature.attendance.leave

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.files.AttachmentDraft
import com.schoolapp.core.model.leave.LeaveType
import java.time.LocalDate
import java.time.format.DateTimeParseException
import java.time.temporal.ChronoUnit

/** Open "Request leave" form; [type] is null for a child's leave (staff pick a type). */
@Immutable
data class LeaveForm(
    val from: String,
    val to: String,
    val reason: String = "",
    val type: LeaveType? = null,
    val attachments: AttachmentDraft = AttachmentDraft(),
    val isSaving: Boolean = false,
    val fromMissing: Boolean = false,
    val toMissing: Boolean = false,
    val rangeInvalid: Boolean = false,
    val reasonMissing: Boolean = false,
    val reasonTooShort: Boolean = false,
    val error: AppError? = null,
) {
    val hasErrors: Boolean get() = fromMissing || toMissing || rangeInvalid || reasonMissing || reasonTooShort

    /** Inclusive calendar days in the range, or null while the range is incomplete or reversed. */
    val calendarDays: Int?
        get() = try {
            val start = LocalDate.parse(from)
            val end = LocalDate.parse(to)
            if (end < start) null else ChronoUnit.DAYS.between(start, end).toInt() + 1
        } catch (e: DateTimeParseException) {
            null
        }

    companion object {
        /** API limits for `reason` (API min 3; the web form caps at 500). */
        const val REASON_MIN = 3
        const val REASON_MAX = 500

        /** One supporting document per request (`attachmentFileId`). */
        const val MAX_ATTACHMENTS = 1
    }
}

object LeaveFormValidator {
    /** Flags every problem at once: dates required, from <= to, reason required and long enough. */
    fun validate(form: LeaveForm): LeaveForm {
        val fromMissing = form.from.isBlank()
        val toMissing = form.to.isBlank()
        val reason = form.reason.trim()
        return form.copy(
            fromMissing = fromMissing,
            toMissing = toMissing,
            rangeInvalid = !fromMissing && !toMissing && form.from > form.to,
            reasonMissing = reason.isEmpty(),
            reasonTooShort = reason.isNotEmpty() && reason.length < LeaveForm.REASON_MIN,
        )
    }
}
