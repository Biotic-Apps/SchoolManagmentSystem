package com.schoolapp.feature.approvals.detail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.approvals.ApprovalsRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.approval.ApprovalDecision
import com.schoolapp.core.model.approval.ApprovalRequest
import com.schoolapp.core.model.approval.ApprovalStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ApprovalDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: ApprovalsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val requestId: String = checkNotNull(savedStateHandle[KEY_ID]) { "Approval id missing" }

    private val _uiState = MutableStateFlow(ApprovalDetailUiState())
    val uiState: StateFlow<ApprovalDetailUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.request == null, loadError = null) }
        viewModelScope.launch {
            val session = authRepository.session.first()
            when (val result = repository.detail(requestId)) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isLoading = false, request = result.data, canDecide = session.canDecide(result.data))
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = result.error) }
            }
        }
    }

    fun onCommentChange(value: String) = _uiState.update { it.copy(comment = value, commentRequired = false) }

    fun onDecide(decision: ApprovalDecision) {
        val state = _uiState.value
        if (!state.showActions || state.busyDecision != null) return
        if (decision.requiresComment && state.comment.isBlank()) {
            _uiState.update { it.copy(commentRequired = true) }
            return
        }
        _uiState.update { it.copy(busyDecision = decision, decideError = null) }
        viewModelScope.launch {
            when (val result = repository.decide(requestId, decision, state.comment)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(busyDecision = null, decided = decision, comment = "") }
                    load()
                }
                is AppResult.Failure -> _uiState.update { it.copy(busyDecision = null, decideError = result.error) }
            }
        }
    }

    /** Server enforces this too; the client only hides actions that would be refused. */
    private fun SessionContext?.canDecide(request: ApprovalRequest): Boolean =
        this != null && request.status == ApprovalStatus.PENDING && has(APPROVE_PERMISSION) &&
            request.requestedById != user.id

    private companion object {
        const val KEY_ID = "id"
        const val APPROVE_PERMISSION = "approvals.approve"
    }
}
