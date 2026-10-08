package com.schoolapp.core.network.dto.academics

import kotlinx.serialization.Serializable

@Serializable
data class CreateClassRequest(val schoolId: String, val name: String, val levelOrder: Int)

/** `PATCH /classes/:id`, `/subjects/:id`, `/rooms/:id` with a new name (rooms may also change capacity). */
@Serializable
data class RenameRequest(val name: String, val capacity: Int? = null)

@Serializable
data class ReorderClassesRequest(val classIds: List<String>)

/** `PUT /classes/:id/subjects` item; omitted nulls mean "none" on the server. */
@Serializable
data class ClassSubjectItemRequest(val subjectId: String, val periodsPerWeek: Int?, val isOptional: Boolean, val group: String?)

/** Body of PUT /classes/:id/subjects. A typed class: Retrofit rejects Map<String, List<…>> (wildcard). */
@Serializable
data class SetClassSubjectsRequest(val items: List<ClassSubjectItemRequest>)

@Serializable
data class CreateSubjectRequest(
    val schoolId: String,
    val name: String,
    val classIds: List<String>? = null,
    val periodsPerWeek: Int? = null,
)

@Serializable
data class CreateRoomRequest(val branchId: String, val name: String, val capacity: Int? = null)

@Serializable
data class CreateSectionRequest(
    val branchId: String,
    val sessionId: String,
    val classId: String,
    val name: String,
    val capacity: Int? = null,
    val group: String? = null,
)
