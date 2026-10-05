package com.schoolapp.feature.organisation.branches.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.organisation.R

@Composable
internal fun BranchTimingsCard(branch: Branch, modifier: Modifier = Modifier) {
    val dayNames = stringArrayResource(R.array.org_week_days)
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.org_branch_timings))
        KeyValueRow(stringResource(R.string.org_branch_opens), formatTime(branch.timings?.opensAt))
        KeyValueRow(stringResource(R.string.org_branch_closes), formatTime(branch.timings?.closesAt))
        KeyValueRow(stringResource(R.string.org_branch_attendance_lock), formatTime(branch.timings?.attendanceLockAt))
        KeyValueRow(
            stringResource(R.string.org_branch_working_days),
            branch.workingDays.mapNotNull { dayNames.getOrNull(it - 1) }.joinToString(", "),
        )
    }
}
