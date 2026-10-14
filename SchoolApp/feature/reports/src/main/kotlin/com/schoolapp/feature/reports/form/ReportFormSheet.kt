package com.schoolapp.feature.reports.form

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FileDownload
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.reports.Report
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.reports.R

/** Filters + format for [report]; [onQueued] fires once the export job is created. */
@Composable
internal fun ReportFormSheet(
    report: Report,
    onDismiss: () -> Unit,
    onQueued: () -> Unit,
    viewModel: ReportFormViewModel = hiltViewModel(key = "report_form_${report.key}"),
) {
    LaunchedEffect(report.key) { viewModel.start(report) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.queuedJobId) {
        if (state.queuedJobId != null) {
            viewModel.onQueuedHandled()
            onQueued()
        }
    }
    var picking by rememberSaveable { mutableStateOf<String?>(null) }

    AppBottomSheet(title = report.title, onDismiss = { if (!state.isSubmitting) onDismiss() }) {
        report.description?.let {
            Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        report.params.forEach { param ->
            ReportParamField(
                param = param,
                value = state.values[param.name].orEmpty(),
                error = state.errors[param.name],
                options = state.optionsFor(param.type),
                onPick = { picking = param.name },
                onRetryOptions = viewModel::retryOptions,
                onValueChange = { viewModel.onValueChange(param.name, it) },
                enabled = !state.isSubmitting,
            )
        }
        if (report.formats.size > 1) {
            Text(stringResource(R.string.reports_format), style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
            SegmentedChoice(
                labels = report.formats.map { it.name },
                selectedIndex = report.formats.indexOf(state.format).coerceAtLeast(0),
                onSelect = { viewModel.onFormatChange(report.formats[it]) },
            )
        }
        state.submitError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        PrimaryButton(
            text = stringResource(R.string.reports_generate),
            onClick = viewModel::submit,
            loading = state.isSubmitting,
            leadingIcon = Icons.Outlined.FileDownload,
        )
    }

    report.params.firstOrNull { it.name == picking }?.let { param ->
        ParamPicker(
            param = param,
            state = state,
            onSelect = { value ->
                viewModel.onValueChange(param.name, value)
                picking = null
            },
            onDismiss = { picking = null },
        )
    }
}
