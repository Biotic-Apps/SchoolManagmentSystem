package com.schoolapp.feature.staff.documents

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.staff.documents.StaffDocumentsRepository
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.model.staff.documents.StaffDocument
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Documents tab of a staff profile: list, upload, verify and reject (`/documents?ownerType=STAFF`). */
@HiltViewModel
internal class StaffDocumentsViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: StaffDocumentsRepository,
    private val files: FilesRepository,
) : ViewModel() {

    private val staffId: String = checkNotNull(savedStateHandle["id"])

    private val _uiState = MutableStateFlow(StaffDocumentsUiState())
    val uiState: StateFlow<StaffDocumentsUiState> = _uiState.asStateFlow()

    private val _messages = Channel<StaffDocsMessage>(Channel.BUFFERED)
    val messages: Flow<StaffDocsMessage> = _messages.receiveAsFlow()

    private var fileJob: Job? = null

    init {
        load()
    }

    fun load(refresh: Boolean = false) {
        _uiState.update { it.copy(isLoading = !refresh, isRefreshing = refresh, loadError = null) }
        viewModelScope.launch {
            when (val result = repository.list(staffId)) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, documents = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, loadError = result.error) }
            }
        }
    }

    fun openUpload() = _uiState.update { it.copy(upload = DocumentUploadForm()) }

    fun closeUpload() {
        if (_uiState.value.upload?.isSaving == true) return
        fileJob?.cancel()
        _uiState.update { it.copy(upload = null) }
    }

    fun onTypeChange(type: String) = editUpload { it.copy(docType = type) }

    fun onNoteChange(note: String) = editUpload { it.copy(note = note) }

    /** Uploads right away; picking again replaces the previous file. */
    fun onFilePicked(uri: String, name: String?, mime: String?) {
        fileJob?.cancel()
        if (!DocumentUploadForm.isAllowedMime(mime)) {
            editUpload { it.copy(fileUri = null, fileName = name, fileId = null, isUploadingFile = false, fileTypeInvalid = true, fileError = null) }
            return
        }
        editUpload { it.copy(fileUri = uri, fileName = name, fileId = null, isUploadingFile = true, fileTypeInvalid = false, fileError = null) }
        fileJob = viewModelScope.launch {
            val result = files.upload(uri, FilePurpose.DOCUMENT)
            editUpload { form ->
                if (form.fileUri != uri) return@editUpload form
                when (result) {
                    is AppResult.Success -> form.copy(fileId = result.data.id, isUploadingFile = false)
                    is AppResult.Failure -> form.copy(isUploadingFile = false, fileError = result.error)
                }
            }
        }
    }

    fun submitUpload() {
        val form = _uiState.value.upload ?: return
        if (form.isSaving) return
        if (form.issues.isNotEmpty()) {
            editUpload { it.copy(showErrors = true) }
            return
        }
        editUpload { it.copy(isSaving = true, saveError = null) }
        viewModelScope.launch {
            when (val result = repository.attach(staffId, checkNotNull(form.docType), checkNotNull(form.fileId), form.note)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(upload = null, documents = listOf(result.data) + it.documents) }
                    _messages.send(StaffDocsMessage.UPLOADED)
                }
                is AppResult.Failure -> editUpload { it.copy(isSaving = false, saveError = result.error) }
            }
        }
    }

    fun openDecision(document: StaffDocument, kind: DecisionKind) =
        _uiState.update { it.copy(decision = DocumentDecision(document.id, kind)) }

    fun closeDecision() {
        if (_uiState.value.decision?.isSaving == true) return
        _uiState.update { it.copy(decision = null) }
    }

    fun onDecisionTextChange(text: String) = editDecision { it.copy(text = text) }

    fun confirmDecision() {
        val decision = _uiState.value.decision ?: return
        if (decision.isSaving) return
        if (!decision.isTextValid) {
            editDecision { it.copy(showErrors = true) }
            return
        }
        editDecision { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            val result = when (decision.kind) {
                DecisionKind.VERIFY -> repository.verify(decision.documentId, decision.text)
                DecisionKind.REJECT -> repository.reject(decision.documentId, decision.text)
            }
            when (result) {
                is AppResult.Success -> {
                    _uiState.update { state ->
                        state.copy(decision = null, documents = state.documents.map { if (it.id == result.data.id) result.data else it })
                    }
                    _messages.send(if (decision.kind == DecisionKind.VERIFY) StaffDocsMessage.VERIFIED else StaffDocsMessage.REJECTED)
                }
                is AppResult.Failure -> editDecision { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    private fun editUpload(change: (DocumentUploadForm) -> DocumentUploadForm) =
        _uiState.update { state -> state.upload?.let { state.copy(upload = change(it)) } ?: state }

    private fun editDecision(change: (DocumentDecision) -> DocumentDecision) =
        _uiState.update { state -> state.decision?.let { state.copy(decision = change(it)) } ?: state }
}
