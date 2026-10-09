package com.schoolapp.feature.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.notifications.NotificationsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val repository: NotificationsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(NotificationsUiState())
    val uiState: StateFlow<NotificationsUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null

    init {
        load(refreshing = false)
    }

    fun refresh() = load(refreshing = true)

    /** Back on screen: fetch new items in the background, keeping the list (no spinner). */
    fun reloadQuietly() = load(refreshing = false, quiet = true)

    fun onUnreadOnlyChange(unreadOnly: Boolean) {
        if (unreadOnly == _uiState.value.unreadOnly) return
        _uiState.update { it.copy(unreadOnly = unreadOnly) }
        load(refreshing = false)
    }

    /** Optimistic: the row turns read immediately and reverts if the server refuses. */
    fun onOpen(id: String) {
        val target = _uiState.value.items.firstOrNull { it.id == id } ?: return
        if (target.isRead) return
        setRead(id, read = true)
        viewModelScope.launch {
            val result = repository.markRead(id)
            if (result is AppResult.Failure) {
                setRead(id, read = false)
                _uiState.update { it.copy(actionError = result.error) }
            }
        }
    }

    fun onMarkAllRead() {
        if (_uiState.value.isMarkingAll || !_uiState.value.hasUnread) return
        _uiState.update { it.copy(isMarkingAll = true, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.markAllRead()) {
                is AppResult.Success -> _uiState.update { s ->
                    s.copy(isMarkingAll = false, items = if (s.unreadOnly) emptyList() else s.items.map { it.copy(isRead = true) })
                }
                is AppResult.Failure -> _uiState.update { it.copy(isMarkingAll = false, actionError = result.error) }
            }
        }
    }

    private fun setRead(id: String, read: Boolean) = _uiState.update { s ->
        s.copy(items = s.items.map { if (it.id == id) it.copy(isRead = read) else it }, actionError = null)
    }

    private fun load(refreshing: Boolean, quiet: Boolean = false) {
        loadJob?.cancel()
        if (!quiet) _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
        loadJob = viewModelScope.launch {
            val result = repository.notifications(_uiState.value.unreadOnly)
            _uiState.update {
                when (result) {
                    is AppResult.Success -> it.copy(isLoading = false, isRefreshing = false, items = result.data)
                    is AppResult.Failure -> if (quiet) it else it.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }
}
