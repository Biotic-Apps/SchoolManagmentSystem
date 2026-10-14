package com.schoolapp.feature.fees.staff.structure.form

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.NumberStepper
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.R

@Composable
internal fun FeePlanFormRoute(onDone: () -> Unit, viewModel: FeePlanFormViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.saved) { if (state.saved) onDone() }
    AppScaffold(
        topBar = {
            AppTopBar(
                title = stringResource(if (state.isEdit) R.string.fees_st_edit_plan else R.string.fees_st_new_plan),
                navigationIcon = { BackButton(onDone) },
            )
        },
    ) { padding ->
        val modifier = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(modifier)
            state.error != null -> ErrorState(appErrorMessage(state.error!!), modifier, onRetry = viewModel::retry)
            else -> FeePlanFormContent(state, viewModel::edit, viewModel::save, modifier)
        }
    }
}

@Composable
private fun FeePlanFormContent(
    state: FeePlanFormUiState,
    onEdit: ((FeePlanForm) -> FeePlanForm) -> Unit,
    onSave: () -> Unit,
    modifier: Modifier,
) {
    val form = state.form
    val issues = form.issues.takeIf { form.showIssues } ?: PlanIssues()
    val enabled = !state.isSaving
    ScreenColumn(modifier, itemSpacing = 12.dp) {
        if (state.wasApproved) item(key = "draft_note") { InlineMessage(stringResource(R.string.fees_st_edit_draft_note), StatusTone.Info) }
        item(key = "class") {
            CreatablePickerField(
                label = stringResource(R.string.fees_st_plan_class),
                options = state.classes.map { PickerOption(it.id, it.name) },
                selectedId = form.classId,
                onSelect = { id -> onEdit { it.copy(classId = id) } },
                enabled = enabled && !state.isEdit,
                errorText = if (issues.classRequired) stringResource(R.string.fees_st_plan_class_required) else null,
            )
        }
        item(key = "name") {
            AppTextField(
                value = form.name,
                onValueChange = { text -> onEdit { it.copy(name = text.take(100)) } },
                label = stringResource(R.string.fees_st_plan_name),
                errorText = if (issues.name) stringResource(R.string.fees_st_plan_name_invalid) else null,
                kind = FieldKind.Title,
                enabled = enabled,
            )
        }
        item(key = "items") { PlanItemsEditor(form, state.heads, issues, enabled, onEdit) }
        item(key = "late") {
            AppCard(verticalSpacing = 8.dp) {
                SwitchRow(
                    title = stringResource(R.string.fees_st_late_fee),
                    checked = form.lateFee,
                    onCheckedChange = { on -> onEdit { it.copy(lateFee = on) } },
                    supporting = stringResource(R.string.fees_st_late_fee_hint),
                    enabled = enabled,
                )
                if (form.lateFee) {
                    MoneyField(
                        value = form.lateAmount,
                        onValueChange = { text -> onEdit { it.copy(lateAmount = text) } },
                        label = stringResource(R.string.fees_st_late_amount),
                        errorText = if (issues.lateAmount) stringResource(R.string.fees_st_item_amount_invalid) else null,
                        enabled = enabled,
                    )
                    NumberStepper(
                        value = form.lateDays,
                        onValueChange = { days -> onEdit { it.copy(lateDays = days) } },
                        label = stringResource(R.string.fees_st_late_days),
                        min = 0,
                        max = 365,
                        enabled = enabled,
                    )
                }
            }
        }
        state.saveError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
        item(key = "save") { PrimaryButton(stringResource(R.string.fees_st_save_plan), onSave, loading = state.isSaving) }
    }
}
