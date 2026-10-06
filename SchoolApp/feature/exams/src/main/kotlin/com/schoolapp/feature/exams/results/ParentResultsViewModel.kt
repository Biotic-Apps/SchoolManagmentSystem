package com.schoolapp.feature.exams.results

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.data.progress.ProgressRepository
import com.schoolapp.core.model.exams.ReportCardStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Parent "Progress & Results": the active child's published results, trend, report cards and teacher notes. */
@HiltViewModel
class ParentResultsViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: ExamsRepository,
    private val progressRepository: ProgressRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ParentResultsUiState())
    val uiState: StateFlow<ParentResultsUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { it.activeChild }
                .distinctUntilChanged()
                .collectLatest { child ->
                    _uiState.value = ParentResultsUiState(childId = child?.id, childName = child?.fullName, isLoading = child != null)
                    load()
                }
        }
    }

    fun retry() = load()

    fun onReportCard(examId: String) {
        val childId = _uiState.value.childId ?: return
        if (_uiState.value.reportCards[examId]?.loading == true) return
        setReportCard(examId) { ReportCardUi(loading = true) }
        viewModelScope.launch {
            val result = repository.reportCard(childId, examId)
            if (_uiState.value.childId != childId) return@launch
            when (result) {
                is AppResult.Failure -> setReportCard(examId) { ReportCardUi(error = result.error) }
                is AppResult.Success -> {
                    val card = result.data
                    val url = card.fileUrl?.takeIf { card.status == ReportCardStatus.READY && it.isNotBlank() }
                    val status = if (card.status == ReportCardStatus.READY && url == null) ReportCardStatus.PENDING else card.status
                    setReportCard(examId) { ReportCardUi(status = status) }
                    if (url != null) _uiState.update { it.copy(openUrl = url) }
                }
            }
        }
    }

    fun onUrlOpened() = _uiState.update { it.copy(openUrl = null) }

    private fun load() {
        val childId = _uiState.value.childId ?: return
        loadJob?.cancel()
        _uiState.update { it.copy(isLoading = true, error = null) }
        loadJob = viewModelScope.launch {
            val notes = async { progressRepository.notes(childId) }
            val results = repository.childResults(childId)
            val noteList = (notes.await() as? AppResult.Success)?.data.orEmpty()
            _uiState.update { state ->
                if (state.childId != childId) return@update state
                when (results) {
                    is AppResult.Success -> state.copy(
                        isLoading = false,
                        results = results.data.results,
                        trend = results.data.trend,
                        notes = noteList,
                    )
                    is AppResult.Failure -> state.copy(isLoading = false, error = results.error, notes = noteList)
                }
            }
        }
    }

    private fun setReportCard(examId: String, value: () -> ReportCardUi) =
        _uiState.update { it.copy(reportCards = it.reportCards + (examId to value())) }
}
