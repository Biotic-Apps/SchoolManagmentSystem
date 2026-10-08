package com.schoolapp.feature.staff.detail

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.staff.StaffAssignment
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffWorkload
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.form.designationLabel

@Composable
internal fun StaffProfileCard(detail: StaffDetail, modifier: Modifier = Modifier) {
    val s = detail.summary
    AppCard(modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            PersonAvatar(s.name, s.photoUrl, size = 64.dp)
            Spacer(Modifier.width(16.dp))
            Column(Modifier.weight(1f)) {
                Text(s.name, style = MaterialTheme.typography.titleLarge, color = AppColors.TextPrimary)
                s.designation?.let { Text(designationLabel(it), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary) }
            }
            s.status?.let { StatusChip(humanizeKey(it), statusTone(it)) }
        }
        KeyValueRow(stringResource(R.string.staff_employee_no), s.employeeNo)
        KeyValueRow(stringResource(R.string.staff_branch), s.branchName)
        KeyValueRow(stringResource(R.string.staff_roles), s.roles.joinToString(", ") { humanizeKey(it) })
        KeyValueRow(stringResource(R.string.staff_email), detail.email)
        KeyValueRow(stringResource(R.string.staff_phone), detail.phone)
        KeyValueRow(stringResource(R.string.staff_qualification), detail.qualification)
        KeyValueRow(stringResource(R.string.staff_join_date), formatDate(detail.joinDate))
    }
}

@Composable
internal fun ProbationCard(requiresReview: Boolean, reviewerName: String?, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(
            title = stringResource(R.string.staff_probation),
            action = if (requiresReview) { { StatusChip(stringResource(R.string.staff_on_probation), StatusTone.Warning) } } else null,
        )
        val text = if (requiresReview) stringResource(R.string.staff_probation_on) else stringResource(R.string.staff_probation_off)
        Text(text, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        if (requiresReview && reviewerName != null) {
            Text(stringResource(R.string.staff_probation_reviewer, reviewerName), style = MaterialTheme.typography.bodyMedium)
        }
    }
}

@Composable
internal fun WorkloadCard(workload: StaffWorkload, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.staff_workload))
        KeyValueRow(stringResource(R.string.staff_periods_week), workload.periodsPerWeek.toString())
        KeyValueRow(stringResource(R.string.staff_sections), workload.sections.toString())
        KeyValueRow(stringResource(R.string.staff_subjects), workload.subjects.toString())
    }
}

@Composable
internal fun AssignmentsCard(assignments: List<StaffAssignment>, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.staff_assignments))
        if (assignments.isEmpty()) {
            Text(stringResource(R.string.staff_assignments_empty), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        assignments.forEach { a ->
            val where = listOfNotNull(listOfNotNull(a.className, a.sectionName).joinToString(" - ").ifBlank { null }, a.subjectName)
            val extra = listOfNotNull(
                a.responsibleStaffName?.let { stringResource(R.string.staff_responsible, it) },
                a.validUntil?.let { stringResource(R.string.staff_substitute_until, formatDate(it).orEmpty()) },
            )
            ListItemRow(
                title = humanizeKey(a.kind),
                supporting = (where + extra).joinToString(" · "),
                leadingIcon = Icons.Outlined.Groups,
            )
        }
    }
}
