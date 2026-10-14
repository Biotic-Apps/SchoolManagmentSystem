package com.schoolapp.feature.exams.grading

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Rule
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
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.grading.GradingScheme
import com.schoolapp.core.model.exams.grading.GradingSchemeStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.grading.components.GradingSchemeSheet

/** Grading schemes tab: per session, create / edit / approve. */
@Composable
internal fun GradingSchemesRoute(modifier: Modifier = Modifier, viewModel: GradingSchemesViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    Box(modifier.fillMaxSize()) {
        RefreshBox(state.isRefreshing, viewModel::refresh) {
            ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
                if (state.sessions.size > 1) {
                    item(key = "sessions") { FilterChipRow(state.sessions.map { SwitcherOption(it.id, it.name) }, state.sessionId, viewModel::onSession) }
                }
                state.message?.let { item(key = "message") { InlineMessage(stringResource(messageText(it)), StatusTone.Success) } }
                state.actionError?.let { item(key = "action_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                when {
                    state.isLoading -> item(key = "loading") { LoadingState() }
                    state.error != null -> item(key = "error") { ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), onRetry = viewModel::retry) }
                    state.schemes.isEmpty() -> item(key = "empty") {
                        EmptyState(stringResource(R.string.exams_grading_empty), message = stringResource(R.string.exams_grading_empty_message), icon = Icons.Outlined.Rule)
                    }
                    else -> items(state.schemes, key = { it.id }) { scheme ->
                        SchemeCard(
                            scheme = scheme,
                            onEdit = if (state.canEdit) ({ viewModel.form.openEdit(scheme) }) else null,
                            onApprove = if (state.canApprove && scheme.status == GradingSchemeStatus.DRAFT) ({ viewModel.requestApprove(scheme.id) }) else null,
                            approving = state.approvingId == scheme.id,
                        )
                    }
                }
            }
        }
        if (state.canAdd && state.sessionId != null) {
            Box(Modifier.align(Alignment.BottomEnd).padding(16.dp)) {
                AppFloatingButton(stringResource(R.string.exams_grading_new), Icons.Outlined.Add, viewModel.form::openNew)
            }
        }
    }
    state.form?.let { GradingSchemeSheet(it, viewModel.form, viewModel::save) }
    if (state.confirmApproveId != null) {
        ConfirmDialog(
            title = stringResource(R.string.exams_grading_approve_title),
            message = stringResource(R.string.exams_grading_approve_message),
            confirmLabel = stringResource(R.string.exams_grading_approve),
            onConfirm = viewModel::approve,
            onDismiss = viewModel::dismissApprove,
        )
    }
}

@Composable
private fun SchemeCard(scheme: GradingScheme, onEdit: (() -> Unit)?, onApprove: (() -> Unit)?, approving: Boolean) {
    AppCard(verticalSpacing = 4.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.Top) {
            Text(scheme.name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
            val approved = scheme.status == GradingSchemeStatus.APPROVED
            StatusChip(
                stringResource(if (approved) R.string.exams_grading_approved else R.string.exams_grading_draft),
                if (approved) StatusTone.Success else StatusTone.Warning,
            )
        }
        Text(stringResource(R.string.exams_grading_pass_line, percent(scheme.passPercent)), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        Text(
            scheme.bands.joinToString("  ·  ") { "${it.grade} ${percent(it.minPercent)}–${percent(it.maxPercent)}%" },
            style = MaterialTheme.typography.bodySmall,
            color = AppColors.TextSecondary,
        )
        if (onEdit != null || onApprove != null) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                onEdit?.let { AppTextButton(stringResource(R.string.exams_grading_edit), it) }
                onApprove?.let { AppTextButton(stringResource(R.string.exams_grading_approve), it, loading = approving) }
            }
        }
    }
}

private fun percent(value: Double): String = if (value % 1.0 == 0.0) value.toLong().toString() else value.toString()

private fun messageText(message: GradingMessage): Int = when (message) {
    GradingMessage.CREATED -> R.string.exams_grading_created
    GradingMessage.UPDATED -> R.string.exams_grading_updated
    GradingMessage.APPROVED -> R.string.exams_grading_approved_message
}
