package com.schoolapp.feature.exams.board

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.feature.exams.ExamPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Supervisors: mark-sheet completeness of one exam, grouped by class-section. */
@HiltViewModel
class CompletenessViewModel @Inject constructor(
    private val repository: ExamsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(CompletenessUiState())
    val uiState: StateFlow<CompletenessUiState> = _uiState.asStateFlow()

    private var sheetsJob: Job? = null

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canEdit = ExamPermissions.canEdit(session), canApprove = ExamPermissions.canApprove(session)) }
            when (val result = repository.exams(branchId = session.activeBranchId)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
                is AppResult.Success -> {
                    val exams = result.data.filter { it.status != ExamStatus.DRAFT }
                    val selected = _uiState.value.selectedExamId?.takeIf { id -> exams.any { it.id == id } } ?: defaultExam(exams)?.id
                    _uiState.update { it.copy(isLoading = false, exams = exams, selectedExamId = selected) }
                    loadSheets(refreshing = false)
                }
            }
        }
    }

    fun onExamSelected(examId: String) {
        if (examId == _uiState.value.selectedExamId) return
        _uiState.update { it.copy(selectedExamId = examId, sheets = emptyList(), filter = null) }
        loadSheets(refreshing = false)
    }

    /** Filter chip id: a [MarkSheetStatus] name, or [ALL]. */
    fun onFilterSelected(id: String) = _uiState.update { state ->
        state.copy(filter = MarkSheetStatus.entries.firstOrNull { it.name == id })
    }

    fun refresh() = loadSheets(refreshing = true)

    /** Back from a sheet: quietly refresh statuses (the first resume is the initial load). */
    fun onResume() {
        val state = _uiState.value
        if (!state.isLoading && !state.sheetsLoading && state.selectedExamId != null) loadSheets(refreshing = false)
    }

    private fun loadSheets(refreshing: Boolean) {
        val examId = _uiState.value.selectedExamId ?: return
        sheetsJob?.cancel()
        _uiState.update { it.copy(sheetsLoading = !refreshing && it.sheets.isEmpty(), isRefreshing = refreshing, sheetsError = null) }
        sheetsJob = viewModelScope.launch {
            val result = repository.markSheets(examId)
            _uiState.update { state ->
                if (state.selectedExamId != examId) return@update state
                when (result) {
                    is AppResult.Success -> state.copy(sheetsLoading = false, isRefreshing = false, sheets = result.data)
                    is AppResult.Failure -> state.copy(sheetsLoading = false, isRefreshing = false, sheetsError = result.error)
                }
            }
        }
    }

    companion object {
        const val ALL = "ALL"

        /** The exam currently collecting marks, else the first listed. */
        internal fun defaultExam(exams: List<Exam>): Exam? =
            exams.firstOrNull { it.status == ExamStatus.MARKS_OPEN || it.status == ExamStatus.MARKS_CLOSED } ?: exams.firstOrNull()
    }
}
