package com.schoolapp.feature.students.roster

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.people.StudentsRepository
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SectionRosterViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: StudentsRepository,
    authRepository: AuthRepository,
) : ViewModel() {

    private val sectionId: String = checkNotNull(savedStateHandle["sectionId"]) { "Section id missing" }

    private val _uiState = MutableStateFlow(SectionRosterUiState(title = savedStateHandle["title"] ?: "", sectionId = sectionId))
    val uiState: StateFlow<SectionRosterUiState> = _uiState.asStateFlow()

    init {
        load()
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update {
                it.copy(
                    branchId = session.activeBranchId,
                    canPrintCards = session.has("students.edit"),
                    canPrintSlips = session.has("guardians.edit") && session.has("users.edit"),
                )
            }
        }
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.students(sectionId = sectionId)) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, students = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
        }
    }
}
