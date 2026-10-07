package com.schoolapp.feature.timetable.calendar

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.calendar.StudentCalendarRepository
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

/** Parent: the active child's school calendar for today..+[DAYS_AHEAD] days; reloads on child switch. */
@HiltViewModel
class SchoolCalendarViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: StudentCalendarRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(SchoolCalendarUiState())
    val uiState: StateFlow<SchoolCalendarUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { it.activeChild }
                .distinctUntilChanged()
                .collectLatest { child ->
                    _uiState.value = SchoolCalendarUiState(childId = child?.id, childName = child?.fullName, isLoading = child != null)
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
            val from = clock.now().toLocalDate()
            val to = from.plusDays(DAYS_AHEAD.toLong())
            val result = repository.upcoming(childId, from.toString(), to.toString())
            _uiState.update { state ->
                if (state.childId != childId) return@update state
                when (result) {
                    is AppResult.Success -> state.copy(isLoading = false, isRefreshing = false, events = result.data)
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    companion object {
        /** Matches the API default window (today..+90 days). */
        const val DAYS_AHEAD = 90
    }
}
