package com.schoolapp.feature.progress.parent

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.progress.ProgressRepository
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

/** Parent: homework set for the active child's section and the teacher's ticks (`GET /students/:id/homework-completion`). */
@HiltViewModel
class ChildHomeworkViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: ProgressRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChildHomeworkUiState())
    val uiState: StateFlow<ChildHomeworkUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { it.activeChild }
                .distinctUntilChanged()
                .collectLatest { child ->
                    _uiState.value = ChildHomeworkUiState(childId = child?.id, childName = child?.fullName, isLoading = child != null)
                    load(refreshing = false)
                }
        }
    }

    fun retry() = load(refreshing = false)

    fun refresh() = load(refreshing = true)

    private fun load(refreshing: Boolean) {
        val childId = _uiState.value.childId ?: return
        loadJob?.cancel()
        _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
        loadJob = viewModelScope.launch {
            val to = clock.now().toLocalDate()
            val from = to.minusDays((DAYS - 1).toLong())
            val result = repository.homeworkCompletion(childId, from.toString(), to.toString())
            _uiState.update { state ->
                if (state.childId != childId) return@update state
                when (result) {
                    is AppResult.Success -> state.copy(
                        isLoading = false,
                        isRefreshing = false,
                        items = result.data,
                        tally = HomeworkTally.of(result.data),
                    )
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    companion object {
        /** Same window as the web panel's Homework tab. */
        const val DAYS = 30
    }
}
