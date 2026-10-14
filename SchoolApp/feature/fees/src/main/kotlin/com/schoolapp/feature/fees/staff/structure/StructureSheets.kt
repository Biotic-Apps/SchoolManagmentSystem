package com.schoolapp.feature.fees.staff.structure

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.NumberStepper
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.structure.FeeHeadKind
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.R

@Composable
internal fun HeadFormSheet(form: HeadForm, onEdit: ((HeadForm) -> HeadForm) -> Unit, onSave: () -> Unit, onDismiss: () -> Unit) {
    val enabled = !form.isSaving
    AppBottomSheet(title = stringResource(R.string.fees_st_add_head), onDismiss = onDismiss) {
        AppTextField(
            value = form.code,
            onValueChange = { text -> onEdit { it.copy(code = text.uppercase().take(30)) } },
            label = stringResource(R.string.fees_st_head_code),
            supportingText = stringResource(R.string.fees_st_head_code_hint),
            errorText = if (HeadIssue.CODE in form.issues) stringResource(R.string.fees_st_head_code_invalid) else null,
            kind = FieldKind.Code,
            enabled = enabled,
        )
        AppTextField(
            value = form.name,
            onValueChange = { text -> onEdit { it.copy(name = text.take(100)) } },
            label = stringResource(R.string.fees_st_head_name),
            errorText = if (HeadIssue.NAME in form.issues) stringResource(R.string.fees_st_head_name_invalid) else null,
            kind = FieldKind.Title,
            enabled = enabled,
        )
        Text(stringResource(R.string.fees_st_head_kind), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        SegmentedChoice(
            labels = FeeHeadKind.entries.map { headKindLabel(it) },
            selectedIndex = form.kind.ordinal,
            onSelect = { index -> if (enabled) onEdit { it.copy(kind = FeeHeadKind.entries[index]) } },
        )
        SwitchRow(
            title = stringResource(R.string.fees_st_refundable),
            checked = form.refundable,
            onCheckedChange = { on -> onEdit { it.copy(refundable = on) } },
            supporting = stringResource(R.string.fees_st_refundable_hint),
            enabled = enabled,
        )
        SheetFooter(form.error, form.isSaving, onSave, onDismiss)
    }
}

@Composable
internal fun SiblingFormSheet(form: SiblingForm, onEdit: ((SiblingForm) -> SiblingForm) -> Unit, onSave: () -> Unit, onDismiss: () -> Unit) {
    val enabled = !form.isSaving
    val title = if (form.editing == null) R.string.fees_st_add_sibling else R.string.fees_st_edit_sibling
    AppBottomSheet(title = stringResource(title), onDismiss = onDismiss) {
        NumberStepper(
            value = form.childIndex,
            onValueChange = { index -> onEdit { it.copy(childIndex = index) } },
            label = stringResource(R.string.fees_st_child_index),
            min = 2,
            max = 20,
            enabled = enabled && form.editing == null,
        )
        if (form.childTaken) Text(stringResource(R.string.fees_st_child_taken), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        AppTextField(
            value = form.percent,
            onValueChange = { text -> onEdit { it.copy(percent = text.filter(Char::isDigit).take(3)) } },
            label = stringResource(R.string.fees_st_percent),
            errorText = if (form.percentInvalid) stringResource(R.string.fees_st_percent_invalid) else null,
            kind = FieldKind.Number,
            enabled = enabled,
        )
        SheetFooter(form.error, form.isSaving, onSave, onDismiss)
    }
}

@Composable
internal fun SheetFooter(error: AppError?, saving: Boolean, onSave: () -> Unit, onDismiss: () -> Unit, saveLabel: String? = null) {
    error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        AppTextButton(stringResource(R.string.fees_st_cancel), onDismiss, enabled = !saving)
        PrimaryButton(saveLabel ?: stringResource(R.string.fees_st_save), onSave, Modifier.weight(1f), loading = saving)
    }
}
