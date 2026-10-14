package com.schoolapp.feature.notices.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.notices.NoticesRepository
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeStatus
import com.schoolapp.feature.notices.NoticeComposeResult
import com.schoolapp.feature.notices.NoticeEvents
import com.schoolapp.feature.notices.NoticePermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One notice: body + attachments for everyone; managers also get read receipts, and the author edits / publishes drafts. */
@HiltViewModel
class NoticeDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: NoticesRepository,
    private val authRepository: AuthRepository,
    private val events: NoticeEvents,
) : ViewModel() {

    private val id: String = checkNotNull(savedStateHandle["id"]) { "Notice id missing" }

    private val _uiState = MutableStateFlow(NoticeDetailUiState())
    val uiState: StateFlow<NoticeDetailUiState> = _uiState.asStateFlow()

    init {
        val handed = events.opened(id)
        if (handed != null) show(handed) else load()
        viewModelScope.launch {
            events.changes.collect { events.opened(id)?.let(::show) }
        }
    }

    fun load() {
        _uiState.value = NoticeDetailUiState(isLoading = true)
        viewModelScope.launch {
            val branchId = authRepository.session.filterNotNull().first().activeBranchId
            when (val result = repository.notices(branchId, page = 1, pageSize = FALLBACK_PAGE_SIZE)) {
                is AppResult.Failure -> _uiState.value = NoticeDetailUiState(isLoading = false, error = result.error)
                is AppResult.Success -> {
                    val notice = result.data.items.firstOrNull { it.id == id }
                    if (notice == null) {
                        _uiState.value = NoticeDetailUiState(isLoading = false)
                    } else {
                        if (!notice.isRead && notice.status == NoticeStatus.PUBLISHED) launch { repository.markRead(id) }
                        show(notice.copy(isRead = true))
                    }
                }
            }
        }
    }

    fun loadReads() {
        if (!_uiState.value.canSeeReads) return
        _uiState.update { it.copy(readsLoading = true, readsError = null) }
        viewModelScope.launch {
            when (val result = repository.reads(id)) {
                is AppResult.Success -> _uiState.update { it.copy(readsLoading = false, reads = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(readsLoading = false, readsError = result.error) }
            }
        }
    }

    fun askPublish() = _uiState.update { it.copy(confirmPublish = true) }

    fun dismissPublish() = _uiState.update { it.copy(confirmPublish = false) }

    fun publish() {
        val notice = _uiState.value.notice ?: return
        if (_uiState.value.isPublishing) return
        _uiState.update { it.copy(confirmPublish = false, isPublishing = true, actionError = null) }
        viewModelScope.launch {
            when (val result = repository.publish(id, notice)) {
                is AppResult.Failure -> _uiState.update { it.copy(isPublishing = false, actionError = result.error) }
                is AppResult.Success -> {
                    val pending = result.data.status == NoticeStatus.PENDING_REVIEW
                    val outcome = if (pending) NoticeComposeResult.SENT_FOR_APPROVAL else NoticeComposeResult.PUBLISHED
                    _uiState.update { it.copy(isPublishing = false, message = outcome) }
                    events.post(outcome, result.data)
                }
            }
        }
    }

    private fun show(notice: Notice) {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val canManage = NoticePermissions.canAdd(session)
            _uiState.update {
                it.copy(
                    isLoading = false,
                    error = null,
                    notice = notice,
                    canEdit = NoticePermissions.canEdit(session, notice),
                    canPublish = notice.status == NoticeStatus.DRAFT && NoticePermissions.canPublish(session),
                    canSeeReads = canManage && notice.status in READ_STATUSES,
                )
            }
            if (_uiState.value.canSeeReads && _uiState.value.reads == null) loadReads()
        }
    }

    private companion object {
        const val FALLBACK_PAGE_SIZE = 100
        val READ_STATUSES = setOf(NoticeStatus.PUBLISHED, NoticeStatus.EXPIRED)
    }
}
