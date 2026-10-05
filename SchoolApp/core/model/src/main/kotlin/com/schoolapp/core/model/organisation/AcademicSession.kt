package com.schoolapp.core.model.organisation

data class AcademicSession(
    val id: String,
    val branchId: String?,
    val name: String,
    val startDate: String?,
    val endDate: String?,
    val status: String?,
    val termCount: Int,
) {
    val isActive: Boolean get() = status == "ACTIVE"
}
