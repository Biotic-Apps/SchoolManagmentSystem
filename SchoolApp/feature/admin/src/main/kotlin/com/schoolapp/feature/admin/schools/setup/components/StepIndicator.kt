package com.schoolapp.feature.admin.schools.setup.components

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.schools.setup.model.SetupStep

/** "1 School · 2 Branch · …": done steps show a tick; any step up to [reached] (or the next one) can be tapped. */
@Composable
internal fun StepIndicator(current: SetupStep, reached: SetupStep, onSelect: (SetupStep) -> Unit, modifier: Modifier = Modifier) {
    Row(
        modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        SetupStep.entries.forEach { step ->
            val done = step.ordinal < current.ordinal || (step.ordinal <= reached.ordinal && step != current)
            FilterChip(
                selected = step == current,
                onClick = { onSelect(step) },
                enabled = step.ordinal <= reached.ordinal + 1,
                label = { Text("${step.ordinal + 1}. ${stringResource(step.label)}") },
                leadingIcon = if (done) {
                    { Icon(Icons.Outlined.Check, contentDescription = null) }
                } else {
                    null
                },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = AppColors.Primary,
                    selectedLabelColor = AppColors.OnPrimary,
                    selectedLeadingIconColor = AppColors.OnPrimary,
                ),
            )
        }
    }
}
