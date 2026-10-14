package com.schoolapp.feature.fees.staff.invoices.create

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.CreatablePickerField
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.MoneyField
import com.schoolapp.core.designsystem.component.PickerOption
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.FeesDateField
import com.schoolapp.feature.fees.components.StudentSearchPicker

@Composable
internal fun NewInvoiceRoute(onBack: () -> Unit, onCreated: (String) -> Unit, viewModel: NewInvoiceViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val student by viewModel.studentSearch.state.collectAsStateWithLifecycle()
    LaunchedEffect(state.createdId) { state.createdId?.let(onCreated) }
    val issues = if (state.showIssues) state.lineIssues() else emptyMap()
    val enabled = !state.isSaving
    AppScaffold(topBar = { AppTopBar(stringResource(R.string.fees_inv_new), navigationIcon = { BackButton(onBack) }) }) { padding ->
        ScreenColumn(Modifier.padding(padding), itemSpacing = 12.dp) {
            item(key = "student") {
                StudentSearchPicker(student, viewModel.studentSearch, showRequired = state.showIssues && student.selected == null, enabled = enabled)
            }
            item(key = "due") {
                FeesDateField(state.dueDate, stringResource(R.string.fees_inv_due_date), MAX_DATE, viewModel::onDueDate, enabled = enabled)
            }
            state.headsError?.let { item(key = "heads_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
            item(key = "lines_title") {
                Text(stringResource(R.string.fees_inv_lines), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
            }
            if (state.showIssues && state.lines.isEmpty()) {
                item(key = "no_lines") { InlineMessage(stringResource(R.string.fees_inv_lines_required), StatusTone.Error) }
            }
            items(state.lines, key = { "line_${it.key}" }) { line ->
                val problems = issues[line.key].orEmpty()
                AppCard(Modifier.fillMaxWidth(), verticalSpacing = 8.dp, contentPadding = 12.dp) {
                    Row(verticalAlignment = Alignment.Top) {
                        CreatablePickerField(
                            label = stringResource(R.string.fees_inv_line_head),
                            options = state.heads.map { PickerOption(it.id, it.name, it.code) },
                            selectedId = line.feeHeadId,
                            onSelect = { viewModel.onHead(line.key, it) },
                            enabled = enabled,
                            errorText = if (LineIssue.HEAD in problems) stringResource(R.string.fees_inv_line_head_required) else null,
                            modifier = Modifier.weight(1f),
                        )
                        IconButton(onClick = { viewModel.removeLine(line.key) }, enabled = enabled) {
                            Icon(Icons.Outlined.Close, stringResource(R.string.fees_inv_remove_line), tint = AppColors.TextSecondary)
                        }
                    }
                    AppTextField(
                        value = line.description,
                        onValueChange = { text -> viewModel.editLine(line.key) { it.copy(description = text.take(200)) } },
                        label = stringResource(R.string.fees_inv_line_description),
                        errorText = if (LineIssue.DESCRIPTION in problems) stringResource(R.string.fees_inv_line_description_required) else null,
                        enabled = enabled,
                    )
                    MoneyField(
                        value = line.amount,
                        onValueChange = { text -> viewModel.editLine(line.key) { it.copy(amount = text) } },
                        label = stringResource(R.string.fees_inv_line_amount),
                        errorText = if (LineIssue.AMOUNT in problems) stringResource(R.string.fees_inv_line_amount_invalid) else null,
                        enabled = enabled,
                    )
                }
            }
            item(key = "add") { AppTextButton(stringResource(R.string.fees_inv_add_line), viewModel::addLine, enabled = enabled, leadingIcon = Icons.Outlined.Add) }
            item(key = "total") {
                Text(stringResource(R.string.fees_inv_total, MoneyFormat.format(state.totalMinor)), style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
            }
            state.error?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
            item(key = "save") { PrimaryButton(stringResource(R.string.fees_inv_create), viewModel::save, Modifier.fillMaxWidth(), loading = state.isSaving) }
        }
    }
}

private const val MAX_DATE = "2100-12-31"
