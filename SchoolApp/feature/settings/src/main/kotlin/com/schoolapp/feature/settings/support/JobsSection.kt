package com.schoolapp.feature.settings.support

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.WorkHistory
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.settings.JobFilters
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.settings.R
import com.schoolapp.feature.settings.components.OptionPickerField
import com.schoolapp.feature.settings.components.PageControls

/** Invoices, reports, PDFs, imports and other background work; tap a job to see its full error. */
internal fun LazyListScope.jobItems(state: JobsUiState, canEdit: Boolean, vm: JobsViewModel) {
    item(key = "jobs_header") {
        SectionHeader(
            title = stringResource(R.string.settings_support_jobs_title),
            subtitle = stringResource(R.string.settings_support_jobs_hint),
        )
    }
    item(key = "jobs_filters") { JobFiltersRow(state.filters, vm::setFilters) }
    if (state.message == SupportMessage.JOB_RETRIED) {
        item(key = "jobs_message") { InlineMessage(stringResource(R.string.settings_support_job_retried), StatusTone.Success) }
    }
    state.actionError?.let { error -> item(key = "jobs_action_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
    val result = state.result
    when {
        state.isLoading && result == null -> item(key = "jobs_loading") { LoadingState(rows = 2) }
        state.error != null -> item(key = "jobs_error") { ErrorState(loadErrorMessage(state.error), onRetry = vm::reload) }
        result == null || result.items.isEmpty() -> item(key = "jobs_empty") {
            EmptyState(
                title = stringResource(R.string.settings_support_jobs_empty),
                message = stringResource(R.string.settings_support_jobs_empty_message),
                icon = Icons.Outlined.WorkHistory,
            )
        }
        else -> {
            items(result.items, key = { "job_${it.id}" }) { job ->
                JobCard(
                    job = job,
                    canRetry = canEdit && job.status == STATUS_FAILED,
                    retrying = state.retryingId == job.id,
                    onRetry = { vm.retry(job.id) },
                    onOpen = { vm.showDetail(job.id) },
                )
            }
            item(key = "jobs_pages") { PageControls(result.page, result.pageSize, result.total, vm::setPage, enabled = !state.isLoading) }
        }
    }
}

@Composable
private fun JobFiltersRow(filters: JobFilters, onChange: (JobFilters) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        OptionPickerField(
            label = stringResource(R.string.settings_support_queue_filter),
            options = listOf(SwitcherOption(ALL, stringResource(R.string.settings_support_all_queues))) +
                QUEUES.map { SwitcherOption(it, humanizeKey(it)) },
            selectedId = filters.queue ?: ALL,
            onSelect = { id -> onChange(filters.copy(queue = id.takeIf { it != ALL })) },
        )
        FilterChipRow(
            options = listOf(
                SwitcherOption(ALL, stringResource(R.string.settings_support_all_statuses)),
                SwitcherOption("FAILED", stringResource(R.string.settings_support_status_failed)),
                SwitcherOption("RUNNING", stringResource(R.string.settings_support_status_running)),
                SwitcherOption("DONE", stringResource(R.string.settings_support_status_done)),
            ),
            selectedId = filters.status ?: ALL,
            onSelect = { id -> onChange(filters.copy(status = id.takeIf { it != ALL })) },
        )
        DateFilterField(stringResource(R.string.settings_support_from), filters.from, { onChange(filters.copy(from = it)) })
        if (filters != JobFilters()) {
            AppTextButton(stringResource(R.string.settings_support_reset_filters), { onChange(JobFilters()) })
        }
    }
}

private const val ALL = "all"
private val QUEUES = listOf("notifications", "documents", "reports", "imports", "backups", "maintenance", "fees", "payroll", "exams")
