package com.schoolapp.feature.attendance.leave

import com.schoolapp.core.model.leave.LeaveType

/** Field edits of the open leave form; each clears that field's error. */
class LeaveFormActions(private val edit: ((LeaveForm) -> LeaveForm) -> Unit) {

    fun onTypeChange(type: LeaveType) = edit { it.copy(type = type) }

    /** Moving the start past the end drags the end along (a one-day leave stays one day). */
    fun onFromChange(date: String) = edit {
        it.copy(from = date, to = if (it.to.isBlank() || it.to < date) date else it.to, fromMissing = false, rangeInvalid = false)
    }

    fun onToChange(date: String) = edit { it.copy(to = date, toMissing = false, rangeInvalid = false) }

    fun onReasonChange(reason: String) = edit {
        it.copy(reason = reason.take(LeaveForm.REASON_MAX), reasonMissing = false, reasonTooShort = false)
    }
}
