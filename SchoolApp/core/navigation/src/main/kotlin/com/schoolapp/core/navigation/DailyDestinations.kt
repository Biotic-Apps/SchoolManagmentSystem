package com.schoolapp.core.navigation

import kotlinx.serialization.Serializable

/*
 * Phase 3 screens that other modules open (dashboard tiles, shortcuts, menus without an entry for the
 * role). Each is registered by the owning feature's `xxxDestinations(navController)`.
 */

/** :feature:attendance — mark one section's register; [date] is `YYYY-MM-DD`. */
@Serializable
data class AttendanceRegisterDestination(val sectionId: String, val date: String, val title: String)

/** :feature:attendance — leave requests the caller can decide. */
@Serializable
data object LeaveReviewDestination

/** :feature:diary — write or edit the entry for section + date (+ subject). */
@Serializable
data class DiaryEditorDestination(val sectionId: String, val date: String, val subjectId: String? = null, val title: String? = null)

/** :feature:notices — full-screen feed (parents and teachers have no notices menu entry). */
@Serializable
data object NoticesDestination

/** :feature:activities — full-screen list (parents reach it from home and messages). */
@Serializable
data object ActivitiesDestination

/** :feature:health — student health card; null [studentId] = the parent's active child. */
@Serializable
data class HealthCardDestination(val studentId: String? = null)

/** :feature:pickup — parent: authorized pickup persons and early-leave requests for the active child. */
@Serializable
data object PickupDestination

/** :feature:messages — one conversation. */
@Serializable
data class MessageThreadDestination(val threadId: String)

/** :feature:profile — notification categories (push on/off). */
@Serializable
data object NotificationPreferencesDestination
