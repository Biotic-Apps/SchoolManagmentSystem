package com.schoolapp.feature.complaints.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.complaints.ComplaintsRepository
import com.schoolapp.core.model.complaint.Complaint
import com.schoolapp.core.model.complaint.ComplaintStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** One complaint with its timeline; assignee updates/escalates, complainant comments/closes/reopens. */
@HiltViewModel
class ComplaintDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: ComplaintsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val complaintId: String = checkNotNull(savedStateHandle["complaintId"]) { "Complaint id missing" }
    private val openedAsComplainant: Boolean = savedStateHandle["mine"] ?: false
    private var viewerUserId: String? = null

    private val _uiState = MutableStateFlow(ComplaintDetailUiState())
    val uiState: StateFlow<ComplaintDetailUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.detail == null, error = null) }
        viewModelScope.launch {
            viewerUserId = authRepository.session.first()?.user?.id
            when (val result = repository.complaint(complaintId)) {
                is AppResult.Success -> show(result.data)
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
        }
    }

    fun onAddUpdate() {
        val detail = _uiState.value.detail ?: return
        if (!detail.canAddUpdate && !detail.canComment) return
        _uiState.update { it.copy(updateEditor = UpdateEditor(allowStatus = detail.canAddUpdate)) }
    }

    fun onUpdateMessageChange(text: String) = editUpdate { it.copy(message = text, messageMissing = false) }

    fun onUpdateStatusChange(status: ComplaintStatus?) = editUpdate { it.copy(status = status) }

    fun saveUpdate() {
        val editor = _uiState.value.updateEditor ?: return
        if (editor.isSaving) return
        if (editor.message.isBlank()) {
            editUpdate { it.copy(messageMissing = true) }
            return
        }
        editUpdate { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            val status = editor.status.takeIf { editor.allowStatus }
            when (val result = repository.addUpdate(complaintId, editor.message.trim(), status)) {
                is AppResult.Success -> show(result.data)
                is AppResult.Failure -> editUpdate { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    fun onReasonAction(action: ReasonAction) = _uiState.update { it.copy(reasonEditor = ReasonEditor(action)) }

    fun onReasonChange(text: String) = editReason { it.copy(reason = text, reasonMissing = false) }

    fun saveReason() {
        val editor = _uiState.value.reasonEditor ?: return
        if (editor.isSaving) return
        if (editor.reasonRequired && editor.reason.isBlank()) {
            editReason { it.copy(reasonMissing = true) }
            return
        }
        editReason { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            val reason = editor.reason.trim().ifBlank { null }
            val result = when (editor.action) {
                ReasonAction.ESCALATE -> repository.escalate(complaintId, reason)
                ReasonAction.CLOSE -> repository.close(complaintId, reason)
                ReasonAction.REOPEN -> repository.reopen(complaintId, reason)
            }
            when (result) {
                is AppResult.Success -> show(result.data)
                is AppResult.Failure -> editReason { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    fun onDismissSheet() {
        val state = _uiState.value
        if (state.updateEditor?.isSaving == true || state.reasonEditor?.isSaving == true) return
        _uiState.update { it.copy(updateEditor = null, reasonEditor = null) }
    }

    private fun show(complaint: Complaint) = _uiState.update {
        it.copy(
            isLoading = false,
            error = null,
            detail = complaint.toDetailUi(viewerUserId, openedAsComplainant),
            updateEditor = null,
            reasonEditor = null,
        )
    }

    private fun editUpdate(transform: (UpdateEditor) -> UpdateEditor) =
        _uiState.update { state -> state.copy(updateEditor = state.updateEditor?.let(transform)) }

    private fun editReason(transform: (ReasonEditor) -> ReasonEditor) =
        _uiState.update { state -> state.copy(reasonEditor = state.reasonEditor?.let(transform)) }
}
