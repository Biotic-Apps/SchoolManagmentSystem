package com.schoolapp.core.navigation

import kotlinx.serialization.Serializable

/*
 * Academics editing screens opened from other modules (dashboard setup checklist, classes, timetable).
 * Each is registered by the owning feature's `xxxDestinations(navController)`.
 */

/** :feature:organisation — one class: sections, subjects and teachers, all autosaved. */
@Serializable
data class ClassSetupDestination(val classId: String, val branchId: String, val sessionId: String? = null, val schoolId: String? = null)

/** :feature:timetable — bell schedule editor; null [branchId] = the active role's branch. */
@Serializable
data class BellScheduleDestination(val branchId: String? = null)

/** :feature:timetable — draft builder for one section (teachers: their class-teacher section). */
@Serializable
data class TimetableBuilderDestination(val sectionId: String, val title: String? = null)
