package com.schoolapp.feature.exams.sheets

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.model.exams.MarkSheet
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Teacher: mark sheets of every exam open for marks, grouped by exam. */
@HiltViewModel
class MySheetsViewModel @Inject constructor(
    private val repository: ExamsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(MySheetsUiState())
    val uiState: StateFlow<MySheetsUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        load()
    }

    fun load() = fetch(refreshing = false)

    fun refresh() = fetch(refreshing = true)

    /** Coming back from marks entry: quietly reload statuses and counts (the first resume is the initial load). */
    fun onResume() {
        if (!_uiState.value.isLoading && !_uiState.value.isRefreshing) fetch(refreshing = false)
    }

    private fun fetch(refreshing: Boolean) {
        loadJob?.cancel()
        _uiState.update {
            it.copy(isLoading = !refreshing && it.groups.isEmpty(), isRefreshing = refreshing, error = null)
        }
        loadJob = viewModelScope.launch {
            val result = repository.myMarkSheets()
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(isLoading = false, isRefreshing = false, groups = group(result.data))
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    private companion object {
        fun group(sheets: List<MarkSheet>): List<ExamSheetGroup> =
            sheets.groupBy { it.examId }.map { (examId, items) -> ExamSheetGroup(examId, items.first().examName.orEmpty(), items) }
    }
}
