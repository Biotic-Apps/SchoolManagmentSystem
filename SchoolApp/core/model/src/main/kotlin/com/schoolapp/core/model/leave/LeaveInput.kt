package com.schoolapp.core.model.leave

sealed interface LeaveInput {
    val from: String
    val to: String
    val reason: String

    /** Parent for a linked child. */
    data class ForStudent(val studentId: String, override val from: String, override val to: String, override val reason: String) : LeaveInput

    /** Staff for themselves. */
    data class ForSelf(val type: LeaveType, override val from: String, override val to: String, override val reason: String) : LeaveInput
}
