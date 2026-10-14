package com.schoolapp.feature.questionbank.common

import com.schoolapp.core.model.SessionContext

/** What the active role may change; the API enforces the same keys. Papers are generated and published with `questions.add`. */
data class QuestionPermissions(
    val canAdd: Boolean = false,
    val canEdit: Boolean = false,
    val canDelete: Boolean = false,
) {
    companion object {
        fun of(session: SessionContext?) = QuestionPermissions(
            canAdd = session?.has("questions.add") == true,
            canEdit = session?.has("questions.edit") == true,
            canDelete = session?.has("questions.delete") == true,
        )
    }
}
