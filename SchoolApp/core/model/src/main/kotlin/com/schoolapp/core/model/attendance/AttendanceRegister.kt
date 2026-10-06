package com.schoolapp.core.model.attendance

import com.schoolapp.core.model.common.PersonRef

/** One section's register for one date; [entries] is the full roster (status null = not marked yet). */
data class AttendanceRegister(
    val id: String?,
    val sectionId: String,
    val date: String,
    val status: RegisterStatus,
    val version: Int,
    val submittedBy: PersonRef?,
    val onBehalfOf: PersonRef?,
    val lockedAt: String?,
    val entries: List<RegisterEntry>,
)

data class RegisterEntry(
    val entryId: String?,
    val studentId: String,
    val name: String,
    val rollNo: Int?,
    val photoUrl: String?,
    val status: AttendanceStatus?,
    val remark: String?,
    /** Approved leave covers this date; the server prefills LEAVE. */
    val onLeave: Boolean,
)

/** Status chosen for one student when saving or submitting. */
data class EntryMark(val studentId: String, val status: AttendanceStatus, val remark: String? = null)
