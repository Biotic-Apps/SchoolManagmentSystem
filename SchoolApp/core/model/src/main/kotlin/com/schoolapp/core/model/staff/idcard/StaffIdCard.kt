package com.schoolapp.core.model.staff.idcard

enum class IdCardStatus { PENDING, READY, FAILED, UNKNOWN }

/** Latest printable ID card version of a staff member. */
data class StaffIdCard(
    val status: IdCardStatus,
    val fileUrl: String?,
    val version: Int,
    val generatedAt: String?,
)
