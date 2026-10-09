package com.schoolapp.feature.exams.entry.components

import com.schoolapp.core.designsystem.component.AppCard
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.formatMarks
import com.schoolapp.feature.exams.components.studentLabel
import com.schoolapp.feature.exams.entry.MarkError
import com.schoolapp.feature.exams.entry.MarkRowUi

/**
 * One student while entering marks: number-pad field ([imeAction] Next moves to the next row, Done on the last),
 * an Absent toggle that clears and disables the field, and a warning highlight while the row is pending.
 */
@Composable
internal fun MarkEntryRow(
    row: MarkRowUi,
    maxMarks: Double,
    focusRequester: FocusRequester,
    imeAction: ImeAction,
    onMarksChange: (String) -> Unit,
    onAbsentChange: (Boolean) -> Unit,
    onImeAction: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    val tone = when {
        row.error != null -> StatusTone.Error
        row.isPending -> StatusTone.Warning
        else -> null
    }
    AppCard(modifier.fillMaxWidth(), tone = tone, contentPadding = 0.dp) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    studentLabel(row.rollNo, row.name),
                    style = MaterialTheme.typography.bodyLarge,
                    color = AppColors.TextPrimary,
                    modifier = Modifier.weight(1f),
                )
                if (row.isPending) {
                    Spacer(Modifier.width(8.dp))
                    StatusChip(stringResource(R.string.exams_pending), StatusTone.Warning)
                }
            }
            Row(verticalAlignment = Alignment.Top) {
                AppTextField(
                    value = row.text,
                    onValueChange = onMarksChange,
                    label = stringResource(R.string.exams_marks_out_of, formatMarks(maxMarks)),
                    modifier = Modifier.weight(1f).focusRequester(focusRequester),
                    placeholder = if (row.absent) stringResource(R.string.exams_absent) else null,
                    errorText = row.error?.let { markErrorText(it, maxMarks) },
                    enabled = enabled && !row.absent,
                    kind = FieldKind.Decimal,
                    imeAction = imeAction,
                    onImeAction = onImeAction,
                )
                Spacer(Modifier.width(12.dp))
                AbsentToggle(row.absent, enabled, onAbsentChange, Modifier.padding(top = 4.dp))
            }
        }
    }
}

@Composable
private fun AbsentToggle(absent: Boolean, enabled: Boolean, onChange: (Boolean) -> Unit, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .heightIn(min = 48.dp)
            .toggleable(value = absent, enabled = enabled, role = Role.Checkbox, onValueChange = onChange)
            .padding(end = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Checkbox(
            checked = absent,
            onCheckedChange = null,
            enabled = enabled,
            colors = CheckboxDefaults.colors(checkedColor = AppColors.Primary, uncheckedColor = AppColors.TextSecondary),
        )
        Spacer(Modifier.width(6.dp))
        Text(stringResource(R.string.exams_absent), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
    }
}

@Composable
private fun markErrorText(error: MarkError, maxMarks: Double): String = when (error) {
    MarkError.INVALID -> stringResource(R.string.exams_error_invalid)
    MarkError.NEGATIVE -> stringResource(R.string.exams_error_negative)
    MarkError.TOO_HIGH -> stringResource(R.string.exams_error_too_high, formatMarks(maxMarks))
    MarkError.TOO_MANY_DECIMALS -> stringResource(R.string.exams_error_decimals)
}
