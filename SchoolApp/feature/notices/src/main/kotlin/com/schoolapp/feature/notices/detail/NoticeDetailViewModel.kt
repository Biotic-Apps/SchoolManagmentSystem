package com.schoolapp.feature.notices.detail

import androidx.compose.runtime.Immutable
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.notices.NoticesRepository
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.feature.notices.NoticeEvents
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class NoticeDetailUiState(val isLoading: Boolean = true, val notice: Notice? = null, val error: AppError? = null)

/** One notice; uses the copy handed over by the feed, otherwise reloads the feed and marks it read. */
@HiltViewModel
class NoticeDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: NoticesRepository,
    private val authRepository: AuthRepository,
    events: NoticeEvents,
) : ViewModel() {

    private val id: String = checkNotNull(savedStateHandle["id"]) { "Notice id missing" }

    private val _uiState = MutableStateFlow(events.opened(id)?.let { NoticeDetailUiState(isLoading = false, notice = it) } ?: NoticeDetailUiState())
    val uiState: StateFlow<NoticeDetailUiState> = _uiState.asStateFlow()

    init {
        if (_uiState.value.notice == null) load()
    }

    fun load() {
        _uiState.value = NoticeDetailUiState(isLoading = true)
        viewModelScope.launch {
            val branchId = authRepository.session.filterNotNull().first().activeBranchId
            _uiState.value = when (val result = repository.notices(branchId)) {
                is AppResult.Failure -> NoticeDetailUiState(isLoading = false, error = result.error)
                is AppResult.Success -> {
                    val notice = result.data.firstOrNull { it.id == id }
                    if (notice != null && !notice.isRead) launch { repository.markRead(id) }
                    NoticeDetailUiState(isLoading = false, notice = notice?.copy(isRead = true))
                }
            }
        }
    }
}
