package com.schoolapp.core.model.organisation

data class CalendarEvent(
    val id: String,
    val type: String?,
    val title: String,
    val startDate: String?,
    val endDate: String?,
    val description: String?,
    val schoolId: String? = null,
    /** null = whole-school entry. */
    val branchId: String? = null,
)
