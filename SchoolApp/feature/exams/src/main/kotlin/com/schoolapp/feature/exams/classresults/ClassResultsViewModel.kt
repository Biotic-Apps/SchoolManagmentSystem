package com.schoolapp.feature.exams.classresults

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.ExamsRepository
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

/** Staff: computed results of one exam and class-section; a row opens the student's subject marks. */
@HiltViewModel
class ClassResultsViewModel @Inject constructor(
    private val repository: ExamsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ClassResultsUiState())
    val uiState: StateFlow<ClassResultsUiState> = _uiState.asStateFlow()

    private var listJob: Job? = null

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val canApprove = ExamPermissions.canApprove(session)
            when (val result = repository.exams(branchId = session.activeBranchId)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
                is AppResult.Success -> {
                    val exams = result.data.filter { ClassResultsRules.isVisible(it, canApprove) }
                    val selected = _uiState.value.selectedExamId?.takeIf { id -> exams.any { it.id == id } } ?: exams.firstOrNull()?.id
                    _uiState.update { it.copy(isLoading = false, exams = exams, selectedExamId = selected) }
                    loadSections(refreshing = false)
                }
            }
        }
    }

    fun onExamSelected(examId: String) {
        if (examId == _uiState.value.selectedExamId) return
        _uiState.update { it.copy(selectedExamId = examId, sections = emptyList(), selectedSectionId = null, results = emptyList(), openStudentId = null) }
        loadSections(refreshing = false)
    }

    fun onSectionSelected(sectionId: String) {
        if (sectionId == _uiState.value.selectedSectionId) return
        _uiState.update { it.copy(selectedSectionId = sectionId, results = emptyList(), openStudentId = null) }
        loadResults(refreshing = false)
    }

    /** Pull to refresh: the selected section's results; before a section is known, the sections too. */
    fun refresh() = if (_uiState.value.selectedSectionId != null) loadResults(refreshing = true) else loadSections(refreshing = true)

    fun onStudentClick(studentId: String) = _uiState.update { it.copy(openStudentId = studentId) }

    fun onSheetDismiss() = _uiState.update { it.copy(openStudentId = null) }

    /** Sections of the selected exam (kept selection, else the first), then that section's results. */
    private fun loadSections(refreshing: Boolean) {
        val examId = _uiState.value.selectedExamId ?: return
        listJob?.cancel()
        _uiState.update { it.copy(listLoading = !refreshing, isRefreshing = refreshing, listError = null) }
        listJob = viewModelScope.launch {
            val sections = when (val result = repository.markSheets(examId)) {
                is AppResult.Failure -> return@launch finish(examId) { it.copy(listError = result.error) }
                is AppResult.Success -> ClassResultsRules.sectionsOf(result.data)
            }
            val sectionId = _uiState.value.selectedSectionId?.takeIf { id -> sections.any { it.id == id } } ?: sections.firstOrNull()?.id
            _uiState.update { if (it.selectedExamId == examId) it.copy(sections = sections, selectedSectionId = sectionId) else it }
            if (sectionId == null) finish(examId) { it.copy(results = emptyList()) } else fetchResults(examId, sectionId)
        }
    }

    private fun loadResults(refreshing: Boolean) {
        val state = _uiState.value
        val examId = state.selectedExamId ?: return
        val sectionId = state.selectedSectionId ?: return
        listJob?.cancel()
        _uiState.update { it.copy(listLoading = !refreshing, isRefreshing = refreshing, listError = null) }
        listJob = viewModelScope.launch { fetchResults(examId, sectionId) }
    }

    private suspend fun fetchResults(examId: String, sectionId: String) {
        when (val result = repository.sectionResults(examId, sectionId)) {
            is AppResult.Success -> finish(examId) { it.copy(results = result.data) }
            is AppResult.Failure -> finish(examId) { it.copy(listError = result.error) }
        }
    }

    private fun finish(examId: String, change: (ClassResultsUiState) -> ClassResultsUiState) = _uiState.update { state ->
        if (state.selectedExamId != examId) state else change(state.copy(listLoading = false, isRefreshing = false))
    }
}
