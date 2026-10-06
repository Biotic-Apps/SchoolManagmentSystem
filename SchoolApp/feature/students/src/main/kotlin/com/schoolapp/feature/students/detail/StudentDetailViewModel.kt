package com.schoolapp.feature.students.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.people.StudentsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class StudentDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: StudentsRepository,
) : ViewModel() {

    private val studentId: String = checkNotNull(savedStateHandle["id"]) { "Student id missing" }

    private val _uiState = MutableStateFlow(StudentDetailUiState())
    val uiState: StateFlow<StudentDetailUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.detail == null, error = null) }
        viewModelScope.launch {
            _uiState.value = when (val result = repository.student(studentId)) {
                is AppResult.Success -> StudentDetailUiState(isLoading = false, detail = result.data)
                is AppResult.Failure -> StudentDetailUiState(isLoading = false, error = result.error)
            }
        }
    }
}
