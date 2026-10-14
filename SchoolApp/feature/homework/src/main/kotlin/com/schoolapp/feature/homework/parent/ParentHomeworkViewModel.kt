package com.schoolapp.feature.homework.parent

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.homework.HomeworkRepository
import com.schoolapp.core.model.homework.Homework
import com.schoolapp.core.model.homework.HomeworkChange
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class ParentHomeworkUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val childId: String? = null,
    val homework: List<Homework> = emptyList(),
    val change: HomeworkChange? = null,
)

/** Active child's homework (web HomeworkParentPage); reloads on child switch and after a submission. */
@HiltViewModel
class ParentHomeworkViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: HomeworkRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ParentHomeworkUiState())
    val uiState: StateFlow<ParentHomeworkUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { it.activeChild?.id }
                .distinctUntilChanged()
                .collectLatest { childId ->
                    _uiState.value = ParentHomeworkUiState(isLoading = childId != null, childId = childId)
                    load()
                }
        }
        viewModelScope.launch {
            repository.changes.collect { change ->
                if (change == HomeworkChange.SUBMITTED) _uiState.update { it.copy(change = change) }
                load()
            }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true, isLoading = it.error != null && it.homework.isEmpty(), error = null) }
        load()
    }

    fun onChangeShown() = _uiState.update { it.copy(change = null) }

    private fun load() {
        val childId = _uiState.value.childId ?: return _uiState.update { it.copy(isLoading = false, isRefreshing = false) }
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            val result = repository.forStudent(childId)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(isLoading = false, isRefreshing = false, error = null, homework = result.data)
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }
}
