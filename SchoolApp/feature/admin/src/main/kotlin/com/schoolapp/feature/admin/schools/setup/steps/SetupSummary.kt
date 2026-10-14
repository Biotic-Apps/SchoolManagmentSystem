package com.schoolapp.feature.admin.schools.setup.steps

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.schools.setup.components.weekdaysText
import com.schoolapp.feature.admin.schools.setup.model.BellGenerator
import com.schoolapp.feature.admin.schools.setup.model.SetupForm
import com.schoolapp.feature.admin.schools.setup.model.SetupPresets

/** Review rows per section (label to value) and the "We'll create …" sentence (web summary.ts). */
internal data class SetupSummary(
    val sentence: String,
    val school: List<Pair<String, String>>,
    val branch: List<Pair<String, String>>,
    val principal: List<Pair<String, String>>,
    val academics: List<Pair<String, String>>,
    val classes: List<Pair<String, String>>,
    val bell: List<Pair<String, String>>,
)

@Composable
internal fun setupSummary(form: SetupForm): SetupSummary {
    val school = form.school
    val branch = form.branch
    val principal = form.principal
    val academics = form.academics
    val included = form.includedClasses
    val subjects = included.flatMap { row -> row.subjects.map { it.name } }.distinct()
    val notGiven = stringResource(R.string.setup_not_given)

    val parts = mutableListOf(
        stringResource(R.string.setup_sum_one_school),
        stringResource(R.string.setup_sum_one_branch),
        stringResource(R.string.setup_sum_principal, principal.name.trim().ifEmpty { stringResource(R.string.setup_sum_the_principal) }),
    )
    if (academics.createSession) {
        parts += stringResource(R.string.setup_sum_session, academics.sessionName)
        if (included.isNotEmpty()) parts += pluralStringResource(R.plurals.setup_class_count, included.size, included.size)
        if (subjects.isNotEmpty()) parts += pluralStringResource(R.plurals.setup_subject_count, subjects.size, subjects.size)
        parts += stringResource(R.string.setup_sum_bell)
    }

    val everyDay = BellGenerator.everyDay(form.bell)
    val bellRows = mutableListOf(
        stringResource(R.string.setup_every_day) to stringResource(
            R.string.setup_bell_line,
            pluralStringResource(R.plurals.setup_period_count, form.bell.periodsPerDay, form.bell.periodsPerDay),
            form.bell.periodMinutes,
            formatTime(everyDay.firstOrNull()?.startTime).orEmpty(),
            formatTime(everyDay.lastOrNull()?.endTime).orEmpty(),
        ),
    )
    if (form.bell.shortFriday && form.fridayWorks) {
        val friday = form.bell.friday
        bellRows += stringResource(R.string.setup_panel_friday) to stringResource(
            R.string.setup_friday_line,
            pluralStringResource(R.plurals.setup_period_count, friday.periodsPerDay, friday.periodsPerDay),
            friday.periodMinutes,
            formatTime(BellGenerator.friday(form.bell).lastOrNull()?.endTime).orEmpty(),
        )
    }

    return SetupSummary(
        sentence = stringResource(R.string.setup_we_will_create, parts.joinToString(", ")),
        school = listOfNotNull(
            stringResource(R.string.setup_sum_name) to "${school.name} (${school.code.uppercase()})",
            stringResource(R.string.setup_sum_contact) to listOf(school.phone, school.email).filter { it.isNotBlank() }.joinToString(" · ").ifEmpty { notGiven },
            school.website.takeIf { it.isNotBlank() }?.let { stringResource(R.string.setup_website) to it },
            school.address.takeIf { it.isNotBlank() }?.let { stringResource(R.string.setup_address) to it },
        ),
        branch = listOf(
            stringResource(R.string.setup_sum_name) to "${branch.name} (${branch.code.uppercase()})",
            stringResource(R.string.setup_sum_school_hours) to "${formatTime(branch.opensAt)} – ${formatTime(branch.closesAt)}",
            stringResource(R.string.setup_sum_teacher_hours) to "${formatTime(branch.staffArrivesAt)} – ${formatTime(branch.staffLeavesAt)}",
            stringResource(R.string.setup_sum_lock) to formatTime(branch.attendanceLockAt).orEmpty(),
            stringResource(R.string.setup_working_days) to weekdaysText(branch.workingDays),
        ),
        principal = listOf(
            stringResource(R.string.setup_sum_name) to principal.name,
            stringResource(R.string.setup_sum_signs_in) to listOf(principal.email, principal.phone).filter { it.isNotBlank() }.joinToString(" / "),
            stringResource(R.string.setup_password) to stringResource(
                if (principal.generatePassword) R.string.setup_sum_password_generated else R.string.setup_sum_password_set,
            ),
        ),
        academics = if (!academics.createSession) {
            listOf(stringResource(R.string.setup_sum_session_label) to stringResource(R.string.setup_sum_no_session))
        } else {
            listOf(
                stringResource(R.string.setup_sum_session_label) to
                    "${academics.sessionName} · ${formatDate(academics.startDate)} – ${formatDate(academics.endDate)}",
            )
        },
        classes = if (included.isEmpty()) {
            listOf(stringResource(R.string.setup_step_classes) to stringResource(R.string.setup_sum_none))
        } else {
            included.map { row ->
                row.name to "${SetupPresets.sectionsText(row.sections)} · ${pluralStringResource(R.plurals.setup_subject_count, row.subjects.size, row.subjects.size)}"
            }
        },
        bell = bellRows,
    )
}
