package com.schoolapp.feature.organisation.setup.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.KeyboardArrowDown
import androidx.compose.material.icons.outlined.KeyboardArrowUp
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.NumberStepper
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.academics.ClassSubject
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.setup.CurriculumController

/** One subject: name, periods/week stepper, Optional toggle, group chips, move up/down, remove. */
@Composable
internal fun SubjectRow(
    subject: ClassSubject,
    index: Int,
    count: Int,
    groups: List<String>?,
    edit: Boolean,
    error: ActionError?,
    controller: CurriculumController,
    onDismissError: () -> Unit,
) {
    Column(Modifier.padding(vertical = 6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(subject.name, style = MaterialTheme.typography.bodyLarge, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(stringResource(R.string.org_periods_per_week), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
            NumberStepper(
                value = subject.periodsPerWeek,
                onValueChange = { controller.setPeriods(subject.subjectId, it) },
                label = stringResource(R.string.org_periods_of, subject.name),
                min = 0,
                max = MAX_PERIODS,
                enabled = edit,
            )
        }
        if (edit) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                FilterChip(
                    selected = subject.isOptional,
                    onClick = { controller.setOptional(subject.subjectId, !subject.isOptional) },
                    label = { Text(stringResource(R.string.org_optional)) },
                )
                Row(Modifier.weight(1f), horizontalArrangement = Arrangement.End) {
                    IconButton(onClick = { controller.move(index, index - 1) }, enabled = index > 0) {
                        Icon(Icons.Outlined.KeyboardArrowUp, contentDescription = stringResource(R.string.org_move_up, subject.name))
                    }
                    IconButton(onClick = { controller.move(index, index + 1) }, enabled = index < count - 1) {
                        Icon(Icons.Outlined.KeyboardArrowDown, contentDescription = stringResource(R.string.org_move_down, subject.name))
                    }
                    IconButton(onClick = { controller.remove(subject.subjectId) }) {
                        Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.org_remove_subject, subject.name), tint = AppColors.Error)
                    }
                }
            }
        } else if (subject.isOptional) {
            Text(stringResource(R.string.org_optional), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        if (groups != null) {
            val all = stringResource(R.string.org_all_sections)
            FilterChipRow(
                options = listOf(SwitcherOption(ALL, all)) + groups.map { SwitcherOption(it, it) },
                selectedId = subject.group ?: ALL,
                onSelect = { if (edit) controller.setGroup(subject.subjectId, it.takeIf { g -> g != ALL }) },
            )
        }
        error?.let {
            Row(verticalAlignment = Alignment.CenterVertically) {
                InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error, Modifier.weight(1f))
                IconButton(onClick = onDismissError) { Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.org_dismiss)) }
            }
        }
    }
}

private const val ALL = "__all__"
private const val MAX_PERIODS = 20
