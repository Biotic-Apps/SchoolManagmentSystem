package com.schoolapp.feature.messages.conversation

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.messages.MessagesRepository
import com.schoolapp.core.model.files.Attachment
import com.schoolapp.core.model.message.ChatMessage
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

/** One conversation: paged history, optimistic sending with retry, attachments, read receipt on open. */
@HiltViewModel
class ConversationViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: MessagesRepository,
    private val filesRepository: FilesRepository,
    private val authRepository: AuthRepository,
    clock: AppClock,
) : ViewModel() {

    private val threadId: String = checkNotNull(savedStateHandle["threadId"]) { "Thread id missing" }

    private val _uiState = MutableStateFlow(ConversationUiState(today = clock.now().toLocalDate()))
    val uiState: StateFlow<ConversationUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.thread == null, error = null) }
        viewModelScope.launch {
            val myUserId = authRepository.session.first()?.user?.id
            when (val result = repository.thread(threadId)) {
                is AppResult.Success -> {
                    val detail = result.data
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            myUserId = myUserId,
                            thread = detail.thread,
                            messages = detail.messages,
                            olderCursor = detail.olderCursor,
                        )
                    }
                    if (!_uiState.value.readOnly) repository.markRead(threadId)
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, myUserId = myUserId, error = result.error) }
            }
        }
    }

    fun loadOlder() {
        val state = _uiState.value
        val cursor = state.olderCursor ?: return
        if (state.isLoadingOlder || state.isLoading) return
        _uiState.update { it.copy(isLoadingOlder = true) }
        viewModelScope.launch {
            when (val result = repository.thread(threadId, before = cursor)) {
                is AppResult.Success -> _uiState.update { current ->
                    val known = current.messages.map(ChatMessage::id).toSet()
                    current.copy(
                        isLoadingOlder = false,
                        messages = result.data.messages.filterNot { it.id in known } + current.messages,
                        olderCursor = result.data.olderCursor,
                    )
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoadingOlder = false) }
            }
        }
    }

    fun onDraftChange(text: String) = _uiState.update { it.copy(draft = text) }

    fun onAttach(uri: String) {
        _uiState.update { it.copy(uploadingCount = it.uploadingCount + 1, attachError = null) }
        viewModelScope.launch {
            val result = filesRepository.upload(uri)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> {
                        val file = result.data
                        state.copy(
                            uploadingCount = state.uploadingCount - 1,
                            draftAttachments = state.draftAttachments + Attachment(file.id, file.url, file.mime, file.name),
                        )
                    }
                    is AppResult.Failure -> state.copy(uploadingCount = state.uploadingCount - 1, attachError = result.error)
                }
            }
        }
    }

    fun onRemoveAttachment(id: String) =
        _uiState.update { state -> state.copy(draftAttachments = state.draftAttachments.filterNot { it.id == id }) }

    /** Appends a "sending" bubble at once; the server message replaces it on success. */
    fun send() {
        val state = _uiState.value
        if (!state.canSend) return
        val pending = PendingMessage(
            tempId = "local-${UUID.randomUUID()}",
            body = state.draft.trim(),
            attachments = state.draftAttachments,
        )
        _uiState.update { it.copy(pending = it.pending + pending, draft = "", draftAttachments = emptyList(), attachError = null) }
        deliver(pending)
    }

    /** Resends a failed bubble with the same text and attachments. */
    fun retry(tempId: String) {
        val pending = _uiState.value.pending.firstOrNull { it.tempId == tempId && it.failed } ?: return
        val retried = pending.copy(failed = false)
        replacePending(retried)
        deliver(retried)
    }

    private fun deliver(pending: PendingMessage) {
        viewModelScope.launch {
            when (val result = repository.send(threadId, pending.body, pending.attachments.map(Attachment::id))) {
                is AppResult.Success -> _uiState.update { state ->
                    val sent = result.data.message
                    state.copy(
                        pending = state.pending.filterNot { it.tempId == pending.tempId },
                        messages = if (state.messages.any { it.id == sent.id }) state.messages else state.messages + sent,
                        silentIds = if (result.data.deliveredSilently) state.silentIds + sent.id else state.silentIds,
                    )
                }
                is AppResult.Failure -> replacePending(pending.copy(failed = true))
            }
        }
    }

    private fun replacePending(updated: PendingMessage) = _uiState.update { state ->
        state.copy(pending = state.pending.map { if (it.tempId == updated.tempId) updated else it })
    }
}
