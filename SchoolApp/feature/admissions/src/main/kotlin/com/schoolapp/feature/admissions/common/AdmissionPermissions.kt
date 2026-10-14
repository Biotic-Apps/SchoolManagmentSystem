package com.schoolapp.feature.admissions.common

import com.schoolapp.core.model.SessionContext

/** Permission keys the admissions screens check (the API enforces the same ones). */
object AdmissionPermissions {
    const val VIEW = "admissions.view"
    const val ADD = "admissions.add"
    const val EDIT = "admissions.edit"
    const val APPROVE = "admissions.approve"

    /** Verifying or rejecting an applicant's documents. */
    const val VERIFY_DOCUMENTS = "students.edit"
}

/** What the signed-in user may do in admissions. */
data class AdmissionAccess(
    val canAdd: Boolean = false,
    val canEdit: Boolean = false,
    val canApprove: Boolean = false,
    val canVerifyDocuments: Boolean = false,
) {
    companion object {
        fun of(session: SessionContext?) = AdmissionAccess(
            canAdd = session?.has(AdmissionPermissions.ADD) == true,
            canEdit = session?.has(AdmissionPermissions.EDIT) == true,
            canApprove = session?.has(AdmissionPermissions.APPROVE) == true,
            canVerifyDocuments = session?.has(AdmissionPermissions.VERIFY_DOCUMENTS) == true,
        )
    }
}
