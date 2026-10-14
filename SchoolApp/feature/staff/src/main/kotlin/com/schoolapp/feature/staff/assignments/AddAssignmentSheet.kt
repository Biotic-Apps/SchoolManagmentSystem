package com.schoolapp.feature.staff.assignments

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.staff.assignments.NewStaffAssignment
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.form.OptionPickerField

private const val NONE = ""

@Composable
internal fun AddAssignmentSheet(state: AddAssignmentState, sessions: List<SwitcherOption>, c: AddAssignmentController) {
    var pickDate by rememberSaveable { mutableStateOf(false) }
    val enabled = !state.isSaving
    val required = stringResource(R.string.staff_error_required)
    fun err(field: AssignmentField) = if (field in state.missing) required else null

    AppBottomSheet(title = stringResource(R.string.staff_asg_add_title), onDismiss = { if (enabled) c.dismiss() }) {
        state.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        OptionPickerField(
            label = stringResource(R.string.staff_asg_kind),
            options = NewStaffAssignment.KINDS.map { SwitcherOption(it, humanizeKey(it)) },
            selectedId = state.kind,
            onSelect = c::onKind,
            enabled = enabled,
            errorText = err(AssignmentField.KIND),
        )
        OptionPickerField(
            label = stringResource(R.string.staff_asg_session),
            options = sessions,
            selectedId = state.sessionId,
            onSelect = c::onSession,
            enabled = enabled,
            errorText = err(AssignmentField.SESSION),
        )
        if (state.kind != null) SectionFields(state, c, enabled, ::err)
        SwitchRow(
            title = stringResource(R.string.staff_asg_substitute),
            supporting = stringResource(R.string.staff_asg_substitute_hint),
            checked = state.isSubstitute,
            onCheckedChange = c::onSubstitute,
            enabled = enabled,
        )
        if (state.isSubstitute) {
            PickerField(
                value = formatDate(state.validUntil).orEmpty(),
                label = stringResource(R.string.staff_asg_last_day),
                onClick = { pickDate = true },
                enabled = enabled,
                errorText = err(AssignmentField.VALID_UNTIL),
            )
        }
        PrimaryButton(stringResource(R.string.staff_asg_add_submit), c::submit, loading = state.isSaving)
    }
    if (pickDate) {
        AppDatePickerDialog(
            initialDate = state.validUntil,
            onConfirm = {
                pickDate = false
                c.onValidUntil(it)
            },
            onDismiss = { pickDate = false },
        )
    }
}

@Composable
private fun SectionFields(state: AddAssignmentState, c: AddAssignmentController, enabled: Boolean, err: (AssignmentField) -> String?) {
    val classesError = state.classesError
    when {
        classesError != null -> {
            InlineMessage(appErrorMessage(classesError), StatusTone.Error)
            AppTextButton(text = stringResource(R.string.staff_retry), onClick = c::retryClasses)
        }
        !state.classesLoading && state.sectionOptions.isEmpty() && state.sectionRequired ->
            InlineMessage(stringResource(R.string.staff_asg_no_sections), StatusTone.Warning)
        else -> {
            val wholeBranch = SwitcherOption(NONE, stringResource(R.string.staff_asg_whole_branch))
            OptionPickerField(
                label = stringResource(if (state.classesLoading) R.string.staff_asg_sections_loading else R.string.staff_asg_section),
                options = if (state.sectionRequired) state.sectionOptions else listOf(wholeBranch) + state.sectionOptions,
                selectedId = state.sectionId ?: NONE.takeIf { !state.sectionRequired },
                onSelect = { c.onSection(it.ifEmpty { null }) },
                enabled = enabled && !state.classesLoading,
                errorText = err(AssignmentField.SECTION),
            )
        }
    }
    if (state.showSubject) {
        OptionPickerField(
            label = stringResource(R.string.staff_asg_subject),
            options = state.subjectOptions,
            selectedId = state.subjectId,
            onSelect = c::onSubject,
            enabled = enabled && state.sectionId != null,
            errorText = err(AssignmentField.SUBJECT),
        )
    }
    if (state.showResponsible) {
        OptionPickerField(
            label = stringResource(R.string.staff_asg_responsible),
            options = listOf(SwitcherOption(NONE, stringResource(R.string.staff_asg_none))) + state.teachers,
            selectedId = state.responsibleStaffId ?: NONE,
            onSelect = { c.onResponsible(it.ifEmpty { null }) },
            enabled = enabled,
        )
    }
}
