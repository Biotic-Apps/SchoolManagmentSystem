package com.schoolapp.feature.notices.compose

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.notices.NoticesRepository
import com.schoolapp.core.model.files.AttachmentDraft
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeAudience
import com.schoolapp.core.model.notice.NoticeStatus
import com.schoolapp.feature.notices.NoticeComposeResult
import com.schoolapp.feature.notices.NoticeEvents
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Compose a notice or edit a draft: save as draft, or save then publish (teachers' notices may go to approval). */
@HiltViewModel
class NoticeComposeViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val noticesRepository: NoticesRepository,
    private val filesRepository: FilesRepository,
    private val optionsLoader: AudienceOptionsLoader,
    private val authRepository: AuthRepository,
    private val events: NoticeEvents,
    clock: AppClock,
) : ViewModel() {

    private val editId: String? = savedStateHandle["id"]
    private val _uiState = MutableStateFlow(initialState(clock.now().toLocalDate().toString()))
    val uiState: StateFlow<NoticeComposeUiState> = _uiState.asStateFlow()

    init {
        loadOptions()
    }

    private fun initialState(today: String): NoticeComposeUiState {
        if (editId == null) return NoticeComposeUiState(today = today)
        val draft = events.opened(editId) ?: return NoticeComposeUiState(today = today, editingId = editId, draftMissing = true)
        return NoticeComposeUiState(
            editingId = draft.id,
            title = draft.title,
            body = draft.body,
            audience = draft.audience,
            attachments = AttachmentDraft(items = draft.attachments),
            expiresOn = draft.expiresOn?.take(DATE_LENGTH),
            pinned = draft.pinned,
            today = today,
        )
    }

    fun loadOptions() {
        _uiState.update { it.copy(optionsLoading = true, optionsError = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            if (editId == null) {
                val branch = session.activeBranchId
                _uiState.update { state ->
                    if (branch == null || state.audience.hasTargets) state else state.copy(audience = state.audience.copy(branchIds = listOf(branch)))
                }
            }
            when (val result = optionsLoader.load(session)) {
                is AppResult.Success -> _uiState.update { it.copy(optionsLoading = false, options = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(optionsLoading = false, optionsError = result.error) }
            }
        }
    }

    fun onTitleChange(value: String) = _uiState.update { it.copy(title = value, titleMissing = false) }

    fun onBodyChange(value: String) = _uiState.update { it.copy(body = value, bodyMissing = false) }

    fun onAudienceChange(transform: (NoticeAudience) -> NoticeAudience) =
        _uiState.update { it.copy(audience = transform(it.audience), audienceMissing = false) }

    fun onExpiresOnChange(date: String?) = _uiState.update { it.copy(expiresOn = date, expiryInvalid = false) }

    fun onPinnedChange(pinned: Boolean) = _uiState.update { it.copy(pinned = pinned) }

    fun onAttach(uri: String) {
        if (!_uiState.value.attachments.canAdd(MAX_ATTACHMENTS)) return
        _uiState.update { it.copy(attachments = it.attachments.started(), error = null) }
        viewModelScope.launch {
            val result = filesRepository.upload(uri)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(attachments = state.attachments.added(result.data.toAttachment()))
                    is AppResult.Failure -> state.copy(attachments = state.attachments.failed(), error = result.error)
                }
            }
        }
    }

    fun onRemoveAttachment(id: String) = _uiState.update { it.copy(attachments = it.attachments.removed(id)) }

    fun saveDraft() = submit(ComposeAction.DRAFT)

    fun publish() = submit(ComposeAction.PUBLISH)

    private fun submit(action: ComposeAction) {
        val state = _uiState.value
        if (state.isSaving || state.attachments.isUploading) return
        val validated = validate(state)
        if (validated.hasErrors) return _uiState.update { validated }
        _uiState.update { it.copy(saving = action, error = null, publishFailedAfterSave = false) }
        viewModelScope.launch {
            val saved = when (val result = noticesRepository.save(state.editingId, state.toInput())) {
                is AppResult.Success -> result.data
                is AppResult.Failure -> return@launch _uiState.update { it.copy(saving = null, error = result.error) }
            }
            if (action == ComposeAction.DRAFT) return@launch finish(NoticeComposeResult.DRAFT_SAVED, saved)
            when (val published = noticesRepository.publish(saved.id, saved)) {
                is AppResult.Success -> finish(
                    if (published.data.status == NoticeStatus.PENDING_REVIEW) NoticeComposeResult.SENT_FOR_APPROVAL else NoticeComposeResult.PUBLISHED,
                    published.data,
                )
                is AppResult.Failure -> {
                    events.post(NoticeComposeResult.DRAFT_SAVED, saved)
                    _uiState.update { it.copy(saving = null, editingId = saved.id, error = published.error, publishFailedAfterSave = true) }
                }
            }
        }
    }

    private fun finish(result: NoticeComposeResult, notice: Notice) {
        events.post(result, notice)
        _uiState.update { it.copy(saving = null, editingId = notice.id, result = result) }
    }

    private fun validate(state: NoticeComposeUiState): NoticeComposeUiState = state.copy(
        titleMissing = state.title.isBlank(),
        bodyMissing = state.body.isBlank(),
        audienceMissing = !state.audience.hasTargets,
        expiryInvalid = state.expiresOn != null && state.expiresOn < state.today,
    )

    private companion object {
        const val DATE_LENGTH = 10

        /** The API accepts up to 10 attachments per notice. */
        const val MAX_ATTACHMENTS = 10
    }
}
