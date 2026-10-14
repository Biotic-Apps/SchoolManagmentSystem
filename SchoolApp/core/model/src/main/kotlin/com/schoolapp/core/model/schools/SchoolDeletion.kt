package com.schoolapp.core.model.schools

/** What a permanent delete removes (`GET /schools/:id/deletion-preview`). [summary] keys: branches, users, students… */
data class SchoolDeletionPreview(
    val code: String,
    val name: String,
    val status: String,
    val lastActiveSchool: Boolean,
    val summary: List<Pair<String, Int>>,
    val removedUsers: Int,
    val keptUsers: Int,
)

enum class SchoolDeletionState { IDLE, RUNNING, FAILED, DELETED;

    companion object {
        fun parse(value: String?): SchoolDeletionState = entries.firstOrNull { it.name == value } ?: IDLE
    }
}

data class SchoolDeletionStatus(val state: SchoolDeletionState, val error: String?)
