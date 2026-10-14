package com.schoolapp.feature.students.detail.enrollments

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.students.detail.StudentDetailExtrasRepository
import com.schoolapp.core.model.students.detail.EnrollmentHistoryItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
internal data class EnrollmentHistoryUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val items: List<EnrollmentHistoryItem> = emptyList(),
    val error: AppError? = null,
)

/** Enrollment history tab: every placement of the student (`GET /students/:id/enrollments`). */
@HiltViewModel
internal class EnrollmentHistoryViewModel @Inject constructor(
    private val repository: StudentDetailExtrasRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(EnrollmentHistoryUiState())
    val uiState: StateFlow<EnrollmentHistoryUiState> = _uiState.asStateFlow()

    private var studentId: String? = null

    fun start(id: String) {
        if (studentId == id) return
        studentId = id
        load()
    }

    fun load(refresh: Boolean = false) {
        val id = studentId ?: return
        _uiState.update { it.copy(isLoading = !refresh && it.items.isEmpty(), isRefreshing = refresh, error = null) }
        viewModelScope.launch {
            val result = repository.enrollments(id)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(isLoading = false, isRefreshing = false, items = result.data)
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }
}
