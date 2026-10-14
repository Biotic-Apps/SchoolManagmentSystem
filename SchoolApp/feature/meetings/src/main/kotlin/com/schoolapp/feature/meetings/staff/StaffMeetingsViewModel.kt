package com.schoolapp.feature.meetings.staff

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.meetings.MeetingsRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.meeting.FollowUpStatus
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.feature.meetings.domain.MeetingPage
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Staff: own (or, for supervisors, branch) meetings, server-paged per box, plus the caller's open follow-ups. */
@HiltViewModel
class StaffMeetingsViewModel @Inject constructor(
    private val repository: MeetingsRepository,
    authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(StaffMeetingsUiState())
    val uiState: StateFlow<StaffMeetingsUiState> = _uiState.asStateFlow()

    private var loadedOnce = false
    private var loadJob: Job? = null
    private val moreJobs = mutableMapOf<MeetingBox, Job>()

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canSchedule = session.activeRole != RoleKey.PARENT && session.has(SCHEDULE_PERMISSION)) }
        }
        reload(refreshing = false)
    }

    fun onTabSelected(tab: StaffMeetingsTab) = _uiState.update { it.copy(tab = tab) }

    fun retry() = reload(refreshing = false)

    fun refresh() = reload(refreshing = true)

    /** Back from a meeting's detail: pick up completed / cancelled meetings and new follow-ups. */
    fun onResume() {
        if (loadedOnce) reload(refreshing = false)
    }

    fun loadMore(box: MeetingBox) {
        val current = _uiState.value.page(box)
        if (!current.canLoadMore || _uiState.value.isLoading || loadJob?.isActive == true) return
        setPage(box) { it.copy(isLoadingMore = true, loadMoreError = null) }
        moreJobs[box] = viewModelScope.launch {
            when (val result = repository.meetingsPage(box, null, current.page + 1, MeetingPage.PAGE_SIZE)) {
                is AppResult.Success -> setPage(box) { it.with(result.data) }
                is AppResult.Failure -> setPage(box) { it.copy(isLoadingMore = false, loadMoreError = result.error) }
            }
        }
    }

    fun retryMore(box: MeetingBox) {
        setPage(box) { it.copy(loadMoreError = null) }
        loadMore(box)
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

    private fun setPage(box: MeetingBox, transform: (MeetingPage) -> MeetingPage) = _uiState.update {
        if (box == MeetingBox.UPCOMING) it.copy(upcoming = transform(it.upcoming)) else it.copy(past = transform(it.past))
    }

    private fun reload(refreshing: Boolean) {
        loadJob?.cancel()
        moreJobs.values.forEach { it.cancel() }
        moreJobs.clear()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = refreshing, error = null, today = clock.now().toLocalDate().toString()) }
            load()
        }
    }

    private suspend fun load() = coroutineScope {
        val upcoming = async { repository.meetingsPage(MeetingBox.UPCOMING, null, 1, MeetingPage.PAGE_SIZE) }
        val past = async { repository.meetingsPage(MeetingBox.PAST, null, 1, MeetingPage.PAGE_SIZE) }
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
                upcoming = MeetingPage().with((upcoming.await() as AppResult.Success).data),
                past = MeetingPage().with((past.await() as AppResult.Success).data),
                followUps = (followUps.await() as AppResult.Success).data
                    .filter { f -> f.status == FollowUpStatus.OPEN }
                    .sortedBy { f -> f.dueDate ?: MAX_DATE },
            )
        }
    }

    private companion object {
        const val MAX_DATE = "9999-12-31"
        const val SCHEDULE_PERMISSION = "meetings.add"
    }
}
