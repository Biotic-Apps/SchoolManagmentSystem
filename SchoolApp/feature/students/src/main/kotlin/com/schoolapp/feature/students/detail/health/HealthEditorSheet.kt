package com.schoolapp.feature.students.detail.health

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Save
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.students.R

/** Full health profile editor for staff (web HealthProfileDialog, mode "edit"). */
@Composable
internal fun HealthEditorSheet(
    draft: HealthDraft,
    onChange: (HealthDraft) -> Unit,
    onSave: () -> Unit,
    onDismiss: () -> Unit,
) {
    val enabled = !draft.saving
    AppBottomSheet(title = stringResource(R.string.sd_health_edit), onDismiss = onDismiss) {
        EditorHeading(R.string.sd_health_general)
        Text(stringResource(R.string.sd_health_blood_group), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        val notKnown = stringResource(R.string.sd_health_not_known)
        FilterChipRow(
            options = listOf(SwitcherOption("", notKnown)) + HealthDraft.BloodGroups.map { SwitcherOption(it, it) },
            selectedId = draft.bloodGroup,
            onSelect = { if (enabled) onChange(draft.copy(bloodGroup = it)) },
        )
        AppTextField(
            value = draft.doctorName,
            onValueChange = { onChange(draft.copy(doctorName = it)) },
            label = stringResource(R.string.sd_health_doctor),
            kind = FieldKind.Name,
            errorText = problemText(draft.errorOf("doctorName"), HealthDraft.NAME_MAX),
            enabled = enabled,
        )
        AppTextField(
            value = draft.doctorPhone,
            onValueChange = { onChange(draft.copy(doctorPhone = it)) },
            label = stringResource(R.string.sd_health_doctor_phone),
            kind = FieldKind.Phone,
            errorText = problemText(draft.errorOf("doctorPhone"), 0),
            enabled = enabled,
        )
        AllergiesEditor(draft, onChange, enabled)
        ConditionsEditor(draft, onChange, enabled)
        MedicationsEditor(draft, onChange, enabled)
        EditorHeading(R.string.sd_health_instructions)
        AppTextArea(
            value = draft.instructions,
            onValueChange = { onChange(draft.copy(instructions = it)) },
            label = stringResource(R.string.sd_health_instructions_hint),
            errorText = problemText(draft.errorOf("instructions"), HealthDraft.INSTRUCTIONS_MAX),
            enabled = enabled,
        )
        ContactsEditor(draft, onChange, enabled)
        if (draft.showErrors && draft.problems.isNotEmpty()) {
            InlineMessage(stringResource(R.string.sd_health_fix_errors), StatusTone.Error)
        }
        draft.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        PrimaryButton(
            text = stringResource(R.string.sd_save),
            onClick = onSave,
            modifier = Modifier.fillMaxWidth(),
            loading = draft.saving,
            leadingIcon = Icons.Outlined.Save,
        )
    }
}

@Composable
internal fun EditorHeading(title: Int) {
    Text(stringResource(title), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
}

/** Inline error for a field; [max] fills the "too long" message. */
@Composable
internal fun problemText(problem: HealthProblem?, max: Int): String? = when (problem) {
    null -> null
    HealthProblem.REQUIRED -> stringResource(R.string.sd_required)
    HealthProblem.TOO_LONG -> stringResource(R.string.sd_too_long, max)
    HealthProblem.PHONE -> stringResource(R.string.sd_phone_invalid)
}
