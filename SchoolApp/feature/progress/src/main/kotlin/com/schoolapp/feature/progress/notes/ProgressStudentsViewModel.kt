package com.schoolapp.feature.progress.notes

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.model.people.StudentSummary
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Progress notes tab: pick one of the user's sections, then a student from its roster. */
@HiltViewModel
class ProgressStudentsViewModel @Inject constructor(
    private val scopedSections: ScopedSections,
    private val studentsRepository: StudentsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProgressStudentsUiState())
    val uiState: StateFlow<ProgressStudentsUiState> = _uiState.asStateFlow()

    private var studentsJob: Job? = null

    init {
        load()
    }

    fun retry() = load()

    fun onSectionSelected(sectionId: String) {
        if (sectionId == _uiState.value.selectedSectionId) return
        _uiState.update { it.copy(selectedSectionId = sectionId, students = emptyList()) }
        loadStudents(sectionId)
    }

    fun retryStudents() {
        _uiState.value.selectedSectionId?.let(::loadStudents)
    }

    private fun load() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            when (val result = scopedSections.load()) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
                is AppResult.Success -> {
                    val selected = _uiState.value.selectedSectionId?.takeIf { id -> result.data.any { it.id == id } }
                        ?: result.data.firstOrNull()?.id
                    _uiState.update { it.copy(isLoading = false, sections = result.data, selectedSectionId = selected) }
                    selected?.let(::loadStudents)
                }
            }
        }
    }

    private fun loadStudents(sectionId: String) {
        studentsJob?.cancel()
        studentsJob = viewModelScope.launch {
            _uiState.update { it.copy(isLoadingStudents = true, studentsError = null) }
            val result = studentsRepository.students(sectionId)
            _uiState.update { current ->
                if (current.selectedSectionId != sectionId) return@update current
                when (result) {
                    is AppResult.Success -> current.copy(
                        isLoadingStudents = false,
                        students = result.data.sortedWith(compareBy<StudentSummary, Int?>(nullsLast()) { it.rollNo }.thenBy { it.name }),
                    )
                    is AppResult.Failure -> current.copy(isLoadingStudents = false, studentsError = result.error)
                }
            }
        }
    }
}
