package com.schoolapp.feature.syllabus.plans

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.syllabus.SyllabusRepository
import com.schoolapp.core.model.syllabus.SyllabusPlan
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class MyPlansUiState(
    val isLoading: Boolean = true,
    val plans: List<SyllabusPlan> = emptyList(),
    val error: AppError? = null,
)

/** Teacher: the plans of their sections and subjects (server-scoped). */
@HiltViewModel
class MyPlansViewModel @Inject constructor(
    private val repository: SyllabusRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(MyPlansUiState())
    val uiState: StateFlow<MyPlansUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            _uiState.value = when (val result = repository.plans()) {
                is AppResult.Success -> MyPlansUiState(isLoading = false, plans = result.data)
                is AppResult.Failure -> MyPlansUiState(isLoading = false, error = result.error)
            }
        }
    }
}
