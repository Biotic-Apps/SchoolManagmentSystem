package com.schoolapp.core.model.approval

enum class ApprovalDecision {
    APPROVED,
    REJECTED,
    RETURNED,
    ;

    /** Rejecting or returning must tell the requester why. */
    val requiresComment: Boolean get() = this != APPROVED
}
