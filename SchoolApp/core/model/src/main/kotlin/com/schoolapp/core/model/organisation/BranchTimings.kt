package com.schoolapp.core.model.organisation

data class BranchTimings(
    val opensAt: String?,
    val closesAt: String?,
    val attendanceLockAt: String?,
    val staffArrivesAt: String? = null,
    val staffLeavesAt: String? = null,
)
