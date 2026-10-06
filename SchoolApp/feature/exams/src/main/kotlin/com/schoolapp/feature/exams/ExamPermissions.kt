package com.schoolapp.feature.exams

import com.schoolapp.core.model.SessionContext

/** Exam permission keys used by the mobile screens. */
internal object ExamPermissions {
    const val EDIT = "exams.edit"
    const val SUBMIT = "exams.submit"
    const val APPROVE = "exams.approve"

    fun canEdit(session: SessionContext): Boolean = session.has(EDIT)

    fun canSubmit(session: SessionContext): Boolean = session.has(SUBMIT)

    fun canApprove(session: SessionContext): Boolean = session.has(APPROVE)
}
