package com.schoolapp.feature.dashboard.setup

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.setup.SetupChecklist
import com.schoolapp.core.model.setup.SetupStep
import com.schoolapp.core.navigation.BellScheduleDestination
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.feature.dashboard.DashboardLink
import com.schoolapp.feature.dashboard.R

/**
 * One checklist line: label, tick, count and the screen that completes it (null = status only, then
 * [hintRes] says who does it). [remaining] rows count what is still left ("55 left").
 */
@Immutable
data class SetupRow(
    val step: SetupStep,
    val labelRes: Int,
    val done: Boolean,
    val count: Long,
    val link: DashboardLink?,
    val remaining: Boolean = false,
    val hintRes: Int? = null,
)

/** "Set up your school" card; only built while something is left to do. */
@Immutable
data class SetupCardState(val rows: List<SetupRow>) {
    val doneCount: Int get() = rows.count { it.done }
}

/**
 * Null when the branch is fully set up (or nothing came back), which hides the card. The fee plan is set
 * up by roles with `fees.add` (accountant, super admin); for everyone else that row is status only.
 */
internal fun SetupChecklist.toCard(canSetUpFees: Boolean = false): SetupCardState? {
    if (complete || items.isEmpty() || items.all { it.done }) return null
    return SetupCardState(
        items.map {
            val feesElsewhere = it.step == SetupStep.FEE_PLAN && !canSetUpFees
            SetupRow(
                step = it.step,
                labelRes = labelFor(it.step),
                done = it.done,
                count = it.count,
                link = if (feesElsewhere) null else linkFor(it.step),
                remaining = it.step.countsRemaining,
                hintRes = if (feesElsewhere && !it.done) R.string.dashboard_setup_fee_plan_hint else null,
            )
        },
    )
}

private fun labelFor(step: SetupStep): Int = when (step) {
    SetupStep.SESSION -> R.string.dashboard_setup_session
    SetupStep.CLASSES -> R.string.dashboard_setup_classes
    SetupStep.SUBJECTS -> R.string.dashboard_setup_subjects
    SetupStep.BELL_SCHEDULE -> R.string.dashboard_setup_bell_schedule
    SetupStep.TEACHERS -> R.string.dashboard_setup_teachers
    SetupStep.ALLOCATION -> R.string.dashboard_setup_allocation
    SetupStep.STUDENTS -> R.string.dashboard_setup_students
    SetupStep.TIMETABLE -> R.string.dashboard_setup_timetable
    SetupStep.FEE_PLAN -> R.string.dashboard_setup_fee_plan
}

/** Screens that complete each step; subjects and teacher allocation live in Classes › Class setup. */
private fun linkFor(step: SetupStep): DashboardLink = when (step) {
    SetupStep.BELL_SCHEDULE -> DashboardLink.Screen(BellScheduleDestination())
    else -> DashboardLink.Menu(
        when (step) {
            SetupStep.SESSION -> MenuIds.SESSIONS
            SetupStep.CLASSES, SetupStep.SUBJECTS, SetupStep.ALLOCATION -> MenuIds.CLASSES
            SetupStep.TEACHERS -> MenuIds.STAFF
            SetupStep.STUDENTS -> MenuIds.STUDENTS
            SetupStep.TIMETABLE -> MenuIds.TIMETABLE
            else -> MenuIds.FEES
        },
    )
}
