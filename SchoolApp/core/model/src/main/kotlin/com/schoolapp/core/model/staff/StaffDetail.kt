package com.schoolapp.core.model.staff

data class StaffDetail(
    val summary: StaffSummary,
    val email: String?,
    val phone: String?,
    val qualification: String?,
    val joinDate: String?,
    val assignments: List<StaffAssignment>,
    /** Masked by the server (e.g. `35202-*******-1`); null when none or hidden. */
    val cnic: String? = null,
)
