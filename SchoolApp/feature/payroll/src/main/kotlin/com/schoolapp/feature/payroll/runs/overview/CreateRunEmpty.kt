package com.schoolapp.feature.payroll.runs.overview

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Payments
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.feature.payroll.R

/** No run for the month: `payroll.add` holders create it, everyone else is told who does. */
@Composable
internal fun CreateRunEmpty(monthLabel: String, canCreate: Boolean, creating: Boolean, onCreate: () -> Unit, modifier: Modifier = Modifier) {
    EmptyState(
        title = stringResource(R.string.payroll_runs_empty_title, monthLabel),
        message = stringResource(if (canCreate) R.string.payroll_runs_empty_can_create else R.string.payroll_runs_empty_cannot_create),
        icon = Icons.Outlined.Payments,
        modifier = modifier,
        action = if (canCreate) {
            { PrimaryButton(stringResource(R.string.payroll_runs_create), onCreate, loading = creating, leadingIcon = Icons.Outlined.Add) }
        } else {
            null
        },
    )
}
