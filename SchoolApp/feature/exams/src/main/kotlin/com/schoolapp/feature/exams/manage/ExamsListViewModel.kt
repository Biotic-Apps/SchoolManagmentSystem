package com.schoolapp.feature.exams.manage

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.ExamsRepository
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.ExamStatus
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

@Immutable
data class ExamsListUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val exams: List<Exam> = emptyList(),
    /** null = all statuses. */
    val filter: ExamStatus? = null,
    val canCreate: Boolean = false,
    val formOpen: Boolean = false,
) {
    val visible: List<Exam> get() = exams.filter { filter == null || it.status == filter }
}

/** Staff "Exams" tab: every exam of the active branch, newest status work first; create with `exams.add`. */
@HiltViewModel
class ExamsListViewModel @Inject constructor(
    private val repository: ExamsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ExamsListUiState())
    val uiState: StateFlow<ExamsListUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        load(refreshing = false)
    }

    fun retry() = load(refreshing = false)

    fun refresh() = load(refreshing = true)

    /** Back from an exam: refresh statuses quietly. */
    fun onResume() {
        if (!_uiState.value.isLoading) load(refreshing = false, quiet = true)
    }

    fun onFilterSelected(id: String) = _uiState.update { state -> state.copy(filter = ExamStatus.entries.firstOrNull { it.name == id }) }

    fun openForm() = _uiState.update { if (it.canCreate) it.copy(formOpen = true) else it }

    fun closeForm() = _uiState.update { it.copy(formOpen = false) }

    private fun load(refreshing: Boolean, quiet: Boolean = false) {
        loadJob?.cancel()
        _uiState.update { it.copy(isLoading = !refreshing && !quiet, isRefreshing = refreshing, error = null) }
        loadJob = viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canCreate = session.has(ADD_PERMISSION)) }
            when (val result = repository.exams(branchId = session.activeBranchId)) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isLoading = false, isRefreshing = false, exams = result.data.sortedWith(ORDER))
                }
                is AppResult.Failure -> _uiState.update {
                    if (quiet && it.exams.isNotEmpty()) it.copy(isRefreshing = false) else it.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    private companion object {
        const val ADD_PERMISSION = "exams.add"

        /** Work in progress first (marks open, closed, approved ...), published and drafts after. */
        val ORDER: Comparator<Exam> = compareBy<Exam> {
            when (it.status) {
                ExamStatus.MARKS_OPEN -> 0
                ExamStatus.MARKS_CLOSED -> 1
                ExamStatus.RESULTS_APPROVED -> 2
                ExamStatus.SCHEDULED -> 3
                ExamStatus.DRAFT -> 4
                ExamStatus.PUBLISHED -> 5
            }
        }.thenBy { it.name.lowercase() }
    }
}
