package com.schoolapp.core.model.pickup

enum class EarlyLeaveStatus { REQUESTED, APPROVED, REJECTED, DEPARTED }

/** [time] is API `HH:mm`. */
data class EarlyLeave(
    val id: String,
    val studentId: String,
    val studentName: String?,
    val className: String?,
    val sectionName: String?,
    val date: String,
    val time: String,
    val reason: String,
    val status: EarlyLeaveStatus,
    val pickupPersonName: String?,
    val requestedByName: String?,
)

data class EarlyLeaveInput(val studentId: String, val date: String, val time: String, val reason: String, val pickupPersonId: String?)
