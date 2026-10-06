package com.schoolapp.feature.meetings.parent

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.meetings.MeetingsRepository
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
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Parent: upcoming and past meetings of the child selected in the top bar (reloaded on switch). */
@HiltViewModel
class ParentMeetingsViewModel @Inject constructor(
    private val repository: MeetingsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ParentMeetingsUiState())
    val uiState: StateFlow<ParentMeetingsUiState> = _uiState.asStateFlow()

    private var childId: String? = null
    private var loadedOnce = false
    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull()
                .map { it.activeChild?.id }
                .distinctUntilChanged()
                .collectLatest { id ->
                    childId = id
                    _uiState.value = ParentMeetingsUiState(isLoading = true)
                    load()
                }
        }
    }

    fun retry() = reload(refreshing = false)

    fun refresh() = reload(refreshing = true)

    fun onResume() {
        if (loadedOnce) reload(refreshing = false)
    }

    private fun reload(refreshing: Boolean) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = refreshing, error = null) }
            load()
        }
    }

    private suspend fun load() {
        val id = childId
        if (id == null) {
            _uiState.value = ParentMeetingsUiState(isLoading = false, noChild = true)
            return
        }
        val (upcoming, past) = coroutineScope {
            val upcoming = async { repository.meetings(MeetingBox.UPCOMING, id) }
            val past = async { repository.meetings(MeetingBox.PAST, id) }
            upcoming.await() to past.await()
        }
        val failure = (upcoming as? AppResult.Failure) ?: (past as? AppResult.Failure)
        if (failure != null) {
            _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = failure.error) }
            return
        }
        loadedOnce = true
        _uiState.update {
            it.copy(
                isLoading = false,
                isRefreshing = false,
                error = null,
                upcoming = (upcoming as AppResult.Success).data.chronological(),
                past = (past as AppResult.Success).data.newestFirst(),
            )
        }
    }
}
