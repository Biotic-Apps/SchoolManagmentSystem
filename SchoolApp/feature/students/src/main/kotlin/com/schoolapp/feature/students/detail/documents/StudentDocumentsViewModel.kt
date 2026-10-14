package com.schoolapp.feature.students.detail.documents

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.documents.StudentDocumentsRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.model.documents.SchoolDocument
import com.schoolapp.core.model.files.FilePurpose
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

@Immutable
internal data class StudentDocumentsUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val documents: List<SchoolDocument> = emptyList(),
    val loadError: AppError? = null,
    val upload: DocumentUploadForm? = null,
    val decision: DocumentDecision? = null,
)

internal enum class DocsMessage { UPLOADED, VERIFIED, REJECTED }

/** Documents tab: list, upload (`POST /files` then `POST /documents`), verify and reject. */
@HiltViewModel
internal class StudentDocumentsViewModel @Inject constructor(
    private val repository: StudentDocumentsRepository,
    private val files: FilesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(StudentDocumentsUiState())
    val uiState: StateFlow<StudentDocumentsUiState> = _uiState.asStateFlow()

    private val _messages = Channel<DocsMessage>(Channel.BUFFERED)
    val messages: Flow<DocsMessage> = _messages.receiveAsFlow()

    private var studentId: String? = null
    private var fileJob: Job? = null

    fun start(id: String) {
        if (studentId == id) return
        studentId = id
        load()
    }

    fun load(refresh: Boolean = false) {
        val id = studentId ?: return
        _uiState.update { it.copy(isLoading = !refresh && it.documents.isEmpty(), isRefreshing = refresh, loadError = null) }
        viewModelScope.launch {
            when (val result = repository.list(id)) {
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
        val id = studentId ?: return
        val form = _uiState.value.upload ?: return
        if (form.isSaving) return
        if (form.issues.isNotEmpty()) return editUpload { it.copy(showErrors = true) }
        editUpload { it.copy(isSaving = true, saveError = null) }
        viewModelScope.launch {
            when (val result = repository.attach(id, checkNotNull(form.docType), checkNotNull(form.fileId), form.note)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(upload = null, documents = listOf(result.data) + it.documents) }
                    _messages.send(DocsMessage.UPLOADED)
                }
                is AppResult.Failure -> editUpload { it.copy(isSaving = false, saveError = result.error) }
            }
        }
    }

    fun openDecision(document: SchoolDocument, kind: DecisionKind) = _uiState.update { it.copy(decision = DocumentDecision(document.id, kind)) }

    fun closeDecision() {
        if (_uiState.value.decision?.isSaving == true) return
        _uiState.update { it.copy(decision = null) }
    }

    fun onDecisionTextChange(text: String) = editDecision { it.copy(text = text) }

    fun confirmDecision() {
        val decision = _uiState.value.decision ?: return
        if (decision.isSaving) return
        if (!decision.isTextValid) return editDecision { it.copy(showErrors = true) }
        editDecision { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            val result = when (decision.kind) {
                DecisionKind.VERIFY -> repository.verify(decision.documentId, decision.text)
                DecisionKind.REJECT -> repository.reject(decision.documentId, decision.text)
            }
            when (result) {
                is AppResult.Success -> {
                    _uiState.update { s -> s.copy(decision = null, documents = s.documents.map { if (it.id == result.data.id) result.data else it }) }
                    _messages.send(if (decision.kind == DecisionKind.VERIFY) DocsMessage.VERIFIED else DocsMessage.REJECTED)
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
