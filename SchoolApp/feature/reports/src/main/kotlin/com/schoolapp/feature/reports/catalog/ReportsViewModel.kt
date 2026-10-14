package com.schoolapp.feature.reports.catalog

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.reports.RecentExportsStore
import com.schoolapp.core.data.reports.ReportsRepository
import com.schoolapp.core.model.reports.RecentExport
import com.schoolapp.core.model.reports.Report
import com.schoolapp.core.model.reports.ReportJobState
import com.schoolapp.core.model.reports.ReportJobStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.Instant
import javax.inject.Inject

/** Reports & History: the catalog grouped by area, plus exports started on this device and their status. */
@HiltViewModel
class ReportsViewModel @Inject constructor(
    private val repository: ReportsRepository,
    private val store: RecentExportsStore,
    private val poller: ExportPoller,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ReportsUiState())
    val uiState: StateFlow<ReportsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            store.exports.collect { exports ->
                _uiState.update { it.copy(recent = exports) }
                poller.sync(viewModelScope, exports)
            }
        }
        load()
    }

    fun retry() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        load()
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    fun select(report: Report) = _uiState.update { it.copy(selected = report, message = null, actionError = null) }

    fun closeForm(queued: Boolean = false) = _uiState.update {
        it.copy(selected = null, message = if (queued) ReportsMessage.QUEUED else it.message)
    }

    fun download(export: RecentExport) {
        export.status.fileUrl?.let { url -> _uiState.update { it.copy(openUrl = url) } }
    }

    fun onUrlOpened() = _uiState.update { it.copy(openUrl = null) }

    fun onMessageShown() = _uiState.update { it.copy(message = null) }

    fun dismissActionError() = _uiState.update { it.copy(actionError = null) }

    /** Polling stopped after a network error: start it again. */
    fun checkAgain(export: RecentExport) = store.updateStatus(export.jobId, export.status)

    fun remove(export: RecentExport) = store.remove(export.jobId)

    fun clearRecent() = store.clear()

    /** Re-runs a failed export with the same filters and format. */
    fun retryExport(export: RecentExport) {
        if (export.jobId in _uiState.value.retrying) return
        _uiState.update { it.copy(retrying = it.retrying + export.jobId, actionError = null) }
        viewModelScope.launch {
            val result = repository.generate(export.request)
            _uiState.update { it.copy(retrying = it.retrying - export.jobId) }
            when (result) {
                is AppResult.Failure -> _uiState.update { it.copy(actionError = result.error) }
                is AppResult.Success -> {
                    store.remove(export.jobId)
                    store.add(export.copy(jobId = result.data, startedAt = Instant.now().toString(), status = ReportJobStatus(ReportJobState.QUEUED, null, null, null), pollFailed = false))
                    _uiState.update { it.copy(message = ReportsMessage.RETRY_QUEUED) }
                }
            }
        }
    }

    private fun load() {
        viewModelScope.launch {
            when (val result = repository.catalog()) {
                is AppResult.Failure -> _uiState.update {
                    // A failed pull-to-refresh keeps the list on screen and reports the error separately.
                    if (it.groups.isNotEmpty()) it.copy(isLoading = false, isRefreshing = false, actionError = result.error)
                    else it.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
                is AppResult.Success -> _uiState.update {
                    it.copy(isLoading = false, isRefreshing = false, error = null, groups = result.data.groupByArea())
                }
            }
        }
    }
}
