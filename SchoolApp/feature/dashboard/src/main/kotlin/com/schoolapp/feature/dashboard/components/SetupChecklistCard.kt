package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.outlined.RadioButtonUnchecked
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.model.setup.SetupStep
import com.schoolapp.feature.dashboard.DashboardLink
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.action
import com.schoolapp.feature.dashboard.setup.SetupCardState
import com.schoolapp.feature.dashboard.setup.SetupRow

/** Read-only setup progress; rows open their screen when the role has that menu. */
@Composable
internal fun SetupChecklistCard(
    state: SetupCardState,
    onOpenMenu: (String) -> Unit,
    onOpen: (Any) -> Unit,
    canOpenMenu: (String) -> Boolean,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(
            title = stringResource(R.string.dashboard_setup_title),
            subtitle = stringResource(R.string.dashboard_setup_progress, state.doneCount, state.rows.size),
        )
        state.rows.forEach { row -> SetupRowItem(row, row.link.action(onOpenMenu, onOpen, canOpenMenu)) }
    }
}

@Composable
private fun SetupRowItem(row: SetupRow, onClick: (() -> Unit)?) {
    ListItemRow(
        title = stringResource(row.labelRes),
        onClick = onClick,
        leading = {
            Icon(
                imageVector = if (row.done) Icons.Filled.CheckCircle else Icons.Outlined.RadioButtonUnchecked,
                contentDescription = stringResource(if (row.done) R.string.dashboard_setup_done else R.string.dashboard_setup_todo),
                tint = if (row.done) AppColors.Success else AppColors.TextSecondary,
                modifier = Modifier.size(24.dp),
            )
        },
        trailing = {
            Text(
                text = row.count.toString(),
                style = MaterialTheme.typography.titleMedium,
                color = if (row.done) AppColors.TextPrimary else AppColors.TextSecondary,
            )
        },
    )
}

@Preview(showBackground = true)
@Composable
private fun SetupChecklistCardPreview() = SchoolTheme {
    SetupChecklistCard(
        state = SetupCardState(
            listOf(
                SetupRow(SetupStep.CLASSES, R.string.dashboard_setup_classes, true, 13, DashboardLink.Menu("classes")),
                SetupRow(SetupStep.TEACHERS, R.string.dashboard_setup_teachers, false, 0, DashboardLink.Menu("staff")),
            ),
        ),
        onOpenMenu = {}, onOpen = {}, canOpenMenu = { true },
    )
}
