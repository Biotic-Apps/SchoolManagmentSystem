package com.schoolapp.feature.students.profile

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.Enrollment
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.components.sectionLabel

@Composable
internal fun EnrollmentCard(enrollment: Enrollment?, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(
            title = stringResource(R.string.students_enrollment),
            action = enrollment?.status?.let { status -> { StatusChip(humanizeKey(status), statusTone(status)) } },
        )
        if (enrollment == null) {
            Text(stringResource(R.string.students_no_enrollment), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
            return@AppCard
        }
        KeyValueRow(stringResource(R.string.students_session), enrollment.sessionName)
        KeyValueRow(stringResource(R.string.students_class), sectionLabel(enrollment.className, enrollment.sectionName))
        KeyValueRow(stringResource(R.string.students_roll), enrollment.rollNo?.toString())
        KeyValueRow(stringResource(R.string.students_branch), enrollment.branchName)
        KeyValueRow(stringResource(R.string.students_started), formatDate(enrollment.startDate))
    }
}
