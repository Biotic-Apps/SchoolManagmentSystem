package com.schoolapp.feature.staff.hrletters

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.staff.hrletters.HrLetterTemplate
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.form.OptionPickerField

/** "Generate HR letter" form (web GenerateLetterDialog): template, optional subject and effective date. */
@Composable
internal fun GenerateLetterSheet(
    form: GenerateLetterForm,
    templates: List<HrLetterTemplate>,
    onTemplateChange: (String) -> Unit,
    onSubjectChange: (String) -> Unit,
    onEffectiveDateChange: (String?) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit,
) {
    var pickingDate by rememberSaveable { mutableStateOf(false) }
    val enabled = !form.isSaving
    AppBottomSheet(title = stringResource(R.string.staff_hr_generate_title), onDismiss = onDismiss) {
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        OptionPickerField(
            label = stringResource(R.string.staff_hr_template),
            options = templates.map { SwitcherOption(it.id, it.title, hrLetterTypeLabel(it.type)) },
            selectedId = form.templateId,
            onSelect = onTemplateChange,
            enabled = enabled,
            errorText = if (form.templateMissing) stringResource(R.string.staff_hr_template_required) else form.serverErrors["templateId"],
        )
        AppTextField(
            value = form.subject,
            onValueChange = onSubjectChange,
            label = stringResource(R.string.staff_hr_subject),
            placeholder = stringResource(R.string.staff_hr_subject_hint),
            enabled = enabled,
            errorText = subjectErrorText(form),
        )
        PickerField(
            value = formatDate(form.effectiveDate).orEmpty(),
            label = stringResource(R.string.staff_hr_effective_date),
            onClick = { pickingDate = true },
            enabled = enabled,
            errorText = form.serverErrors["effectiveDate"],
        )
        if (form.effectiveDate != null) {
            AppTextButton(
                text = stringResource(R.string.staff_hr_clear_date),
                onClick = { onEffectiveDateChange(null) },
                enabled = enabled,
                leadingIcon = Icons.Outlined.Close,
            )
        }
        PrimaryButton(
            text = stringResource(R.string.staff_hr_generate_submit),
            onClick = onSubmit,
            modifier = Modifier.fillMaxWidth(),
            loading = form.isSaving,
        )
    }
    if (pickingDate) {
        AppDatePickerDialog(
            initialDate = form.effectiveDate,
            onConfirm = {
                pickingDate = false
                onEffectiveDateChange(it)
            },
            onDismiss = { pickingDate = false },
        )
    }
}

@Composable
private fun subjectErrorText(form: GenerateLetterForm): String? = when (form.subjectError) {
    SubjectError.TOO_SHORT -> stringResource(R.string.staff_hr_subject_too_short)
    SubjectError.TOO_LONG -> stringResource(R.string.staff_hr_subject_too_long)
    null -> form.serverErrors["subject"]
}
