package com.schoolapp.feature.notices.feed

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.notices.NoticesRepository
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.feature.notices.NoticeEvents
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Notices addressed to the user, pinned first; opening one marks it read locally and on the server. */
@HiltViewModel
class NoticesFeedViewModel @Inject constructor(
    private val repository: NoticesRepository,
    private val authRepository: AuthRepository,
    private val events: NoticeEvents,
) : ViewModel() {

    private val _uiState = MutableStateFlow(NoticesFeedUiState())
    val uiState: StateFlow<NoticesFeedUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull().map { it.activeRole to it.activeBranchId }.distinctUntilChanged().collect {
                _uiState.update { it.copy(isLoading = true, notices = emptyList()) }
                load()
            }
        }
        viewModelScope.launch {
            events.composeResult.filterNotNull().collect { result ->
                events.consumeComposeResult()
                _uiState.update { it.copy(message = result) }
                load()
            }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = it.notices.isNotEmpty(), isLoading = it.notices.isEmpty(), error = null) }
        load()
    }

    fun onOpen(id: String): Notice? {
        val notice = _uiState.value.notices.firstOrNull { it.id == id } ?: return null
        val read = notice.copy(isRead = true)
        events.remember(read)
        if (!notice.isRead) {
            _uiState.update { state -> state.copy(notices = state.notices.map { if (it.id == id) read else it }) }
            viewModelScope.launch { repository.markRead(id) }
        }
        return read
    }

    fun onMessageShown() = _uiState.update { it.copy(message = null) }

    private fun load() {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val canAdd = session.has(ADD_PERMISSION)
            when (val result = repository.notices(session.activeBranchId)) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error, canAdd = canAdd) }
                is AppResult.Success -> _uiState.update {
                    it.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = null,
                        canAdd = canAdd,
                        notices = result.data.sortedByDescending { notice -> notice.pinned },
                    )
                }
            }
        }
    }

    private companion object {
        const val ADD_PERMISSION = "notices.add"
    }
}
