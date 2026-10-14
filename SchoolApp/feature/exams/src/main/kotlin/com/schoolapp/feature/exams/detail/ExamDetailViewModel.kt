package com.schoolapp.feature.exams.detail

import androidx.compose.runtime.Immutable
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.admin.ExamAdminRepository
import com.schoolapp.core.model.exams.admin.ExamDetail
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class ExamDetailUiState(
    val title: String = "",
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val exam: ExamDetail? = null,
    val canEdit: Boolean = false,
    val editing: Boolean = false,
)

/** One exam with its tabs; children report changes through [onExamChanged] so every tab sees the same exam. */
@HiltViewModel
class ExamDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: ExamAdminRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val examId: String = checkNotNull(savedStateHandle["examId"]) { "Exam id missing" }

    private val _uiState = MutableStateFlow(ExamDetailUiState(title = savedStateHandle["name"] ?: ""))
    val uiState: StateFlow<ExamDetailUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canEdit = session.has(EDIT_PERMISSION)) }
        }
        load(refreshing = false)
    }

    fun retry() = load(refreshing = false)

    fun refresh() = load(refreshing = true)

    fun onExamChanged(exam: ExamDetail) = _uiState.update { it.copy(exam = exam, title = exam.name) }

    fun openEdit() = _uiState.update { if (it.canEdit && it.exam != null) it.copy(editing = true) else it }

    fun closeEdit() = _uiState.update { it.copy(editing = false) }

    private fun load(refreshing: Boolean) {
        _uiState.update { it.copy(isLoading = !refreshing && it.exam == null, isRefreshing = refreshing, error = null) }
        viewModelScope.launch {
            when (val result = repository.exam(examId)) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isLoading = false, isRefreshing = false, exam = result.data, title = result.data.name)
                }
                is AppResult.Failure -> _uiState.update {
                    if (it.exam != null) it.copy(isRefreshing = false) else it.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    private companion object {
        const val EDIT_PERMISSION = "exams.edit"
    }
}
