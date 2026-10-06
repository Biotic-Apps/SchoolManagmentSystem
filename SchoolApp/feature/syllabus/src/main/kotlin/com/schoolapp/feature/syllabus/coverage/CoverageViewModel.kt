package com.schoolapp.feature.syllabus.coverage

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.syllabus.SyllabusRepository
import com.schoolapp.core.model.syllabus.CoverageRow
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class CoverageUiState(
    val isLoading: Boolean = true,
    val rows: List<CoverageRow> = emptyList(),
    val error: AppError? = null,
)

/** Supervisors: syllabus coverage per section and subject. */
@HiltViewModel
class CoverageViewModel @Inject constructor(
    private val repository: SyllabusRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(CoverageUiState())
    val uiState: StateFlow<CoverageUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            _uiState.value = when (val result = repository.coverage()) {
                is AppResult.Success -> CoverageUiState(isLoading = false, rows = result.data)
                is AppResult.Failure -> CoverageUiState(isLoading = false, error = result.error)
            }
        }
    }
}
