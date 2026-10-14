package com.schoolapp.core.model.organisation

/** Name, code and contacts of a branch (school administrators); [schoolId] and [code] are used on create only. */
data class BranchDetailsInput(
    val schoolId: String?,
    val code: String?,
    val name: String,
    val address: String?,
    val phone: String?,
    val email: String?,
)

/** Students' and teachers' day plus ISO working days (1 = Monday … 7 = Sunday). */
data class BranchScheduleInput(val timings: BranchTimings, val workingDays: List<Int>)

/** A new or edited academic session; dates are `YYYY-MM-DD`. */
data class SessionInput(val name: String, val startDate: String, val endDate: String)

/** [branchId] null = whole-school entry (only on create; the scope of an existing entry can't change). */
data class CalendarEventInput(
    val schoolId: String,
    val branchId: String?,
    val type: String,
    val title: String,
    val startDate: String,
    val endDate: String,
    val description: String?,
)

/** A pickable record (school, principal…). */
data class NamedOption(val id: String, val name: String)
