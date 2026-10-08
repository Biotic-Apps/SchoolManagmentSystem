package com.schoolapp.core.model.academics

/** One item of `PUT /classes/:id/subjects`; list order = sortOrder. */
data class ClassSubjectInput(
    val subjectId: String,
    val periodsPerWeek: Int?,
    val isOptional: Boolean,
    val group: String?,
)

/** A single-field change of a section (`PATCH /sections/:id`); null room/group clears it. */
sealed interface SectionChange {
    data class Capacity(val seats: Int) : SectionChange
    data class Room(val roomId: String?) : SectionChange
    data class Group(val group: String?) : SectionChange
    data class Name(val name: String) : SectionChange
}

data class NewSection(
    val branchId: String,
    val sessionId: String,
    val classId: String,
    val name: String,
    val capacity: Int?,
    val group: String? = null,
)
