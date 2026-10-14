package com.schoolapp.feature.settings.support

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.settings.SupportRepository
import com.schoolapp.core.model.settings.JobFilters
import com.schoolapp.core.model.settings.JobRun
import com.schoolapp.core.model.settings.PagedList
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
internal data class JobsUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val filters: JobFilters = JobFilters(),
    val page: Int = 1,
    val result: PagedList<JobRun>? = null,
    val retryingId: String? = null,
    val detailId: String? = null,
    val message: SupportMessage? = null,
    val actionError: AppError? = null,
) {
    val detail: JobRun? get() = result?.items?.firstOrNull { it.id == detailId }
}

/** Background job runs (system-wide), failed ones first by default, with retry. */
@HiltViewModel
internal class JobsViewModel @Inject constructor(
    private val repository: SupportRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(JobsUiState())
    val uiState: StateFlow<JobsUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        load()
    }

    fun reload() = load()

    fun setFilters(filters: JobFilters) {
        _uiState.update { it.copy(filters = filters, page = 1) }
        load()
    }

    fun setPage(page: Int) {
        _uiState.update { it.copy(page = page) }
        load()
    }

    fun showDetail(id: String?) = _uiState.update { it.copy(detailId = id) }

    fun retry(id: String) {
        if (_uiState.value.retryingId != null) return
        _uiState.update { it.copy(retryingId = id, message = null, actionError = null) }
        viewModelScope.launch {
            val result = repository.retryJob(id)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(retryingId = null, detailId = null, message = SupportMessage.JOB_RETRIED)
                    is AppResult.Failure -> state.copy(retryingId = null, actionError = result.error)
                }
            }
            if (result is AppResult.Success) load()
        }
    }

    private fun load() {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val state = _uiState.value
            val result = repository.jobs(state.filters, state.page, PAGE_SIZE)
            _uiState.update { now ->
                when (result) {
                    is AppResult.Success -> now.copy(isLoading = false, result = result.data)
                    is AppResult.Failure -> now.copy(isLoading = false, error = result.error)
                }
            }
        }
    }

    private companion object {
        const val PAGE_SIZE = 20
    }
}
