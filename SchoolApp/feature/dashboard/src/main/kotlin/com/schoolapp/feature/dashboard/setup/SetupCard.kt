package com.schoolapp.feature.dashboard.setup

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.setup.SetupChecklist
import com.schoolapp.core.model.setup.SetupStep
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.feature.dashboard.DashboardLink
import com.schoolapp.feature.dashboard.R

/** One checklist line: label, tick, count and the menu that completes it (null = status only). */
@Immutable
data class SetupRow(
    val step: SetupStep,
    val labelRes: Int,
    val done: Boolean,
    val count: Long,
    val link: DashboardLink?,
)

/** "Set up your school" card; only built while something is left to do. */
@Immutable
data class SetupCardState(val rows: List<SetupRow>) {
    val doneCount: Int get() = rows.count { it.done }
}

/** Null when the branch is fully set up (or nothing came back), which hides the card. */
internal fun SetupChecklist.toCard(): SetupCardState? {
    if (complete || items.isEmpty() || items.all { it.done }) return null
    return SetupCardState(items.map { SetupRow(it.step, labelFor(it.step), it.done, it.count, linkFor(it.step)) })
}

private fun labelFor(step: SetupStep): Int = when (step) {
    SetupStep.SESSION -> R.string.dashboard_setup_session
    SetupStep.CLASSES -> R.string.dashboard_setup_classes
    SetupStep.SUBJECTS -> R.string.dashboard_setup_subjects
    SetupStep.TEACHERS -> R.string.dashboard_setup_teachers
    SetupStep.STUDENTS -> R.string.dashboard_setup_students
    SetupStep.TIMETABLE -> R.string.dashboard_setup_timetable
    SetupStep.FEE_PLAN -> R.string.dashboard_setup_fee_plan
}

/** Menus that have a screen in the app; subjects are managed on the classes screen. */
private fun linkFor(step: SetupStep): DashboardLink = DashboardLink.Menu(
    when (step) {
        SetupStep.SESSION -> MenuIds.SESSIONS
        SetupStep.CLASSES, SetupStep.SUBJECTS -> MenuIds.CLASSES
        SetupStep.TEACHERS -> MenuIds.STAFF
        SetupStep.STUDENTS -> MenuIds.STUDENTS
        SetupStep.TIMETABLE -> MenuIds.TIMETABLE
        SetupStep.FEE_PLAN -> MenuIds.FEES
    },
)
