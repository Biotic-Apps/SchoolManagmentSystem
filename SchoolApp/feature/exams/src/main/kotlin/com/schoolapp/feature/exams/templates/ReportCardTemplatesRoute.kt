package com.schoolapp.feature.exams.templates

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.templates.ReportCardTemplate
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.templates.components.TemplateFormSheet

/** Report card templates tab: list, create, edit, delete and choose the default. */
@Composable
internal fun ReportCardTemplatesRoute(modifier: Modifier = Modifier, viewModel: TemplatesViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    Box(modifier.fillMaxSize()) {
        RefreshBox(state.isRefreshing, viewModel::refresh) {
            ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
                state.message?.let { item(key = "message") { InlineMessage(stringResource(messageText(it)), StatusTone.Success) } }
                state.actionError?.let { item(key = "action_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                when {
                    state.isLoading -> item(key = "loading") { LoadingState() }
                    state.error != null -> item(key = "error") { ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), onRetry = viewModel::retry) }
                    state.templates.isEmpty() -> item(key = "empty") {
                        EmptyState(
                            stringResource(R.string.exams_templates_empty),
                            message = stringResource(R.string.exams_templates_empty_message),
                            icon = Icons.Outlined.Description,
                        )
                    }
                    else -> items(state.templates, key = { it.id }) { template -> TemplateCard(template, state, viewModel) }
                }
            }
        }
        if (state.canAdd) {
            Box(Modifier.align(Alignment.BottomEnd).padding(16.dp)) {
                AppFloatingButton(stringResource(R.string.exams_templates_new), Icons.Outlined.Add, viewModel::openNew)
            }
        }
    }
    state.form?.let { TemplateFormSheet(it, viewModel::edit, viewModel::save, viewModel::dismissForm) }
    if (state.confirmDeleteId != null) {
        ConfirmDialog(
            title = stringResource(R.string.exams_templates_delete_title),
            message = stringResource(R.string.exams_templates_delete_message),
            confirmLabel = stringResource(R.string.exams_templates_delete),
            onConfirm = viewModel::delete,
            onDismiss = viewModel::dismissDelete,
            destructive = true,
        )
    }
}

@Composable
private fun TemplateCard(template: ReportCardTemplate, state: TemplatesUiState, viewModel: TemplatesViewModel) {
    val busy = state.busyId == template.id
    AppCard(verticalSpacing = 4.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.Top) {
            Text(template.name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
            if (template.isDefault) StatusChip(stringResource(R.string.exams_templates_default), StatusTone.Success)
        }
        val orientation = stringResource(
            if (template.orientation == ReportCardTemplate.LANDSCAPE) R.string.exams_templates_landscape else R.string.exams_templates_portrait,
        )
        Text(
            stringResource(R.string.exams_templates_summary, template.paperSize, orientation, template.signatures.size),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            if (state.canEdit) AppTextButton(stringResource(R.string.exams_templates_edit), { viewModel.openEdit(template) }, enabled = !busy)
            if (state.canEdit && !template.isDefault) {
                AppTextButton(stringResource(R.string.exams_templates_set_default), { viewModel.setDefault(template.id) }, enabled = !busy, loading = busy)
            }
            if (state.canDelete) {
                AppTextButton(
                    stringResource(R.string.exams_templates_delete),
                    { viewModel.requestDelete(template.id) },
                    enabled = !busy,
                    contentColor = AppColors.Error,
                )
            }
        }
    }
}

private fun messageText(message: TemplateMessage): Int = when (message) {
    TemplateMessage.CREATED -> R.string.exams_templates_created
    TemplateMessage.UPDATED -> R.string.exams_templates_updated
    TemplateMessage.DELETED -> R.string.exams_templates_deleted
    TemplateMessage.DEFAULT_SET -> R.string.exams_templates_default_set
}
