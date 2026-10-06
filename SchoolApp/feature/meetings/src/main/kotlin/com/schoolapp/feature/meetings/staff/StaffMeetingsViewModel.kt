package com.schoolapp.feature.meetings.staff

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.meetings.MeetingsRepository
import com.schoolapp.core.model.meeting.FollowUpStatus
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.feature.meetings.domain.chronological
import com.schoolapp.feature.meetings.domain.newestFirst
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Staff: own (or, for supervisors, branch) meetings plus the caller's open follow-ups. */
@HiltViewModel
class StaffMeetingsViewModel @Inject constructor(
    private val repository: MeetingsRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(StaffMeetingsUiState())
    val uiState: StateFlow<StaffMeetingsUiState> = _uiState.asStateFlow()

    private var loadedOnce = false
    private var loadJob: Job? = null

    init {
        reload(refreshing = false)
    }

    fun onTabSelected(tab: StaffMeetingsTab) = _uiState.update { it.copy(tab = tab) }

    fun retry() = reload(refreshing = false)

    fun refresh() = reload(refreshing = true)

    /** Back from a meeting's detail: pick up completed / cancelled meetings and new follow-ups. */
    fun onResume() {
        if (loadedOnce) reload(refreshing = false)
    }

    fun markFollowUpDone(id: String) {
        if (id in _uiState.value.busyFollowUpIds) return
        _uiState.update { it.copy(busyFollowUpIds = it.busyFollowUpIds + id, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.markFollowUpDone(id)) {
                is AppResult.Success -> _uiState.update {
                    it.copy(busyFollowUpIds = it.busyFollowUpIds - id, followUps = it.followUps.filterNot { f -> f.id == id })
                }
                is AppResult.Failure -> _uiState.update { it.copy(busyFollowUpIds = it.busyFollowUpIds - id, actionError = result.error) }
            }
        }
    }

    private fun reload(refreshing: Boolean) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = refreshing, error = null, today = clock.now().toLocalDate().toString()) }
            load()
        }
    }

    private suspend fun load() = coroutineScope {
        val upcoming = async { repository.meetings(MeetingBox.UPCOMING) }
        val past = async { repository.meetings(MeetingBox.PAST) }
        val followUps = async { repository.followUps() }
        val results = listOf(upcoming.await(), past.await(), followUps.await())
        val failure = results.filterIsInstance<AppResult.Failure>().firstOrNull()
        if (failure != null) {
            _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = failure.error) }
            return@coroutineScope
        }
        loadedOnce = true
        _uiState.update {
            it.copy(
                isLoading = false,
                isRefreshing = false,
                upcoming = (upcoming.await() as AppResult.Success).data.chronological(),
                past = (past.await() as AppResult.Success).data.newestFirst(),
                followUps = (followUps.await() as AppResult.Success).data
                    .filter { f -> f.status == FollowUpStatus.OPEN }
                    .sortedBy { f -> f.dueDate ?: MAX_DATE },
            )
        }
    }

    private companion object {
        const val MAX_DATE = "9999-12-31"
    }
}
