package com.schoolapp.feature.payroll.runs.overview

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.PayrollRunStatus
import com.schoolapp.feature.payroll.R
import com.schoolapp.feature.payroll.components.payrollStatusLabel

/** Draft → Calculated → Reviewed → Approved → Partly paid → Paid → Closed, done steps ticked. */
@Composable
internal fun RunStatusStepper(current: PayrollRunStatus, modifier: Modifier = Modifier) {
    val steps = PayrollRunStatus.entries
    val currentIndex = steps.indexOf(current)
    Row(
        modifier.horizontalScroll(rememberScrollState()),
        verticalAlignment = Alignment.Top,
    ) {
        steps.forEachIndexed { index, step ->
            if (index > 0) {
                HorizontalDivider(
                    Modifier.width(16.dp).padding(top = 12.dp),
                    color = if (index <= currentIndex) AppColors.Primary else AppColors.Border,
                )
            }
            val label = if (step == PayrollRunStatus.PARTIALLY_PAID) stringResource(R.string.payroll_step_partly_paid) else payrollStatusLabel(step.name)
            Step(label, done = index < currentIndex, active = index == currentIndex)
        }
    }
}

@Composable
private fun Step(label: String, done: Boolean, active: Boolean) {
    Column(
        Modifier.widthIn(min = 56.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Box(
            Modifier
                .size(24.dp)
                .background(if (done || active) AppColors.Primary else AppColors.Selected, CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            if (done) Icon(Icons.Outlined.Check, null, tint = AppColors.OnPrimary, modifier = Modifier.size(16.dp))
            if (active) Box(Modifier.size(8.dp).background(AppColors.OnPrimary, CircleShape))
        }
        Text(
            label,
            style = MaterialTheme.typography.labelSmall,
            color = if (active) AppColors.Primary else if (done) AppColors.TextPrimary else AppColors.TextSecondary,
            textAlign = TextAlign.Center,
        )
    }
}
