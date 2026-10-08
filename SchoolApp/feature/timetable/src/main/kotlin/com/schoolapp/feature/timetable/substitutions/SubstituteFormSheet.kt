package com.schoolapp.feature.timetable.substitutions

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.timetable.R

/** Callbacks of the "Assign substitute" sheet. */
internal class SubstituteFormActions(
    val onSection: (String) -> Unit,
    val onDate: (String) -> Unit,
    val onPeriod: (Int) -> Unit,
    val onTeacher: (String) -> Unit,
    val onReason: (String) -> Unit,
    val onSubmit: () -> Unit,
    val onDismiss: () -> Unit,
)

/** Section, date, teaching period, substitute and reason; the reason's Done key submits. */
@Composable
internal fun SubstituteFormSheet(
    form: SubstituteForm,
    sections: List<SwitcherOption>,
    periods: List<PeriodChoice>,
    teachers: List<SwitcherOption>,
    actions: SubstituteFormActions,
) {
    var pickDate by rememberSaveable { mutableStateOf(false) }
    val title = stringResource(R.string.timetable_subs_assign)
    AppBottomSheet(title = title, onDismiss = actions.onDismiss) {
        Text(stringResource(R.string.timetable_subs_form_message), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        OptionPickerField(
            label = stringResource(R.string.timetable_subs_section),
            options = sections,
            selectedId = form.sectionId,
            onSelect = actions.onSection,
            errorText = stringResource(R.string.timetable_subs_section_required).takeIf { form.showErrors && form.sectionId == null },
        )
        PickerField(
            value = formatDate(form.date).orEmpty(),
            label = stringResource(R.string.timetable_subs_date),
            onClick = { pickDate = true },
        )
        val periodOptions = periods.map { SwitcherOption(it.index.toString(), periodLabel(it.index, it.number, it.timeRange)) }
        OptionPickerField(
            label = stringResource(R.string.timetable_subs_period),
            options = periodOptions,
            selectedId = form.periodIndex?.toString(),
            onSelect = { id -> id.toIntOrNull()?.let(actions.onPeriod) },
            enabled = periods.isNotEmpty(),
            errorText = when {
                periods.isEmpty() -> stringResource(R.string.timetable_subs_no_periods)
                form.showErrors && form.periodIndex == null -> stringResource(R.string.timetable_subs_period_required)
                else -> null
            },
        )
        OptionPickerField(
            label = stringResource(R.string.timetable_subs_teacher),
            options = teachers,
            selectedId = form.teacherId,
            onSelect = actions.onTeacher,
            errorText = stringResource(R.string.timetable_subs_teacher_required).takeIf { form.showErrors && form.teacherId == null },
        )
        AppTextField(
            value = form.reason,
            onValueChange = actions.onReason,
            label = stringResource(R.string.timetable_subs_reason),
            placeholder = stringResource(R.string.timetable_subs_reason_hint),
            errorText = stringResource(R.string.timetable_subs_reason_required).takeIf { form.showErrors && form.reasonInvalid },
            singleLine = false,
            kind = FieldKind.Sentence,
            imeAction = ImeAction.Done,
            onImeAction = actions.onSubmit,
            minLines = 2,
            maxLines = 4,
        )
        form.error?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
        PrimaryButton(text = title, onClick = actions.onSubmit, loading = form.isSaving, enabled = !form.isSaving)
    }
    if (pickDate) {
        AppDatePickerDialog(
            initialDate = form.date,
            onConfirm = {
                pickDate = false
                actions.onDate(it)
            },
            onDismiss = { pickDate = false },
        )
    }
}
