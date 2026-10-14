package com.schoolapp.feature.attendance.review

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.leave.LeaveRepository
import com.schoolapp.core.designsystem.component.ApprovalAction
import com.schoolapp.core.model.leave.LeaveScope
import com.schoolapp.core.model.leave.LeaveStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Leave requests the caller may decide (scope REVIEW): pending and already decided. */
@HiltViewModel
class LeaveReviewViewModel @Inject constructor(
    private val repository: LeaveRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(LeaveReviewUiState())
    val uiState: StateFlow<LeaveReviewUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = !it.isRefreshing && it.pending.isEmpty() && it.decided.isEmpty(), error = null) }
        viewModelScope.launch {
            val pending = async { repository.leaves(LeaveScope.REVIEW, LeaveStatus.SUBMITTED) }
            val all = repository.leaves(LeaveScope.REVIEW)
            val pendingResult = pending.await()
            _uiState.update { state ->
                when {
                    pendingResult is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = pendingResult.error)
                    else -> state.copy(
                        isLoading = false,
                        isRefreshing = false,
                        pending = (pendingResult as AppResult.Success).data.sortedBy { it.from },
                        decided = (all as? AppResult.Success)?.data.orEmpty()
                            .filter { it.status != LeaveStatus.SUBMITTED }
                            .sortedByDescending { it.createdAt ?: it.from },
                    )
                }
            }
        }
    }

    fun onTabSelected(tab: ReviewTab) = _uiState.update { it.copy(tab = tab) }

    fun onDecidedFilter(status: LeaveStatus?) = _uiState.update { it.copy(decidedFilter = status) }

    fun onOpen(id: String) = open(id, null)

    fun onQuickDecide(id: String, action: ApprovalAction) = open(id, action)

    private fun open(id: String, intent: ApprovalAction?) = _uiState.update { state ->
        val leave = state.pending.firstOrNull { it.id == id } ?: return@update state
        state.copy(decision = LeaveDecision(leave, intent = intent), message = null)
    }

    fun onCommentChange(comment: String) = editDecision { it.copy(comment = comment.take(COMMENT_MAX)) }

    fun onDismissDecision() {
        if (_uiState.value.decision?.busyAction != null) return
        _uiState.update { it.copy(decision = null) }
    }

    fun approve() = decide(ApprovalAction.Approve)

    fun reject() = decide(ApprovalAction.Reject)

    private fun decide(action: ApprovalAction) {
        val decision = _uiState.value.decision ?: return
        if (decision.busyAction != null) return
        editDecision { it.copy(busyAction = action, error = null) }
        val comment = decision.comment.trim().ifBlank { null }
        viewModelScope.launch {
            val result = if (action == ApprovalAction.Approve) {
                repository.approve(decision.leave.id, comment)
            } else {
                repository.reject(decision.leave.id, comment)
            }
            when (result) {
                is AppResult.Failure -> editDecision { it.copy(busyAction = null, error = result.error) }
                is AppResult.Success -> _uiState.update { state ->
                    state.copy(
                        decision = null,
                        pending = state.pending.filterNot { it.id == decision.leave.id },
                        decided = listOf(result.data) + state.decided.filterNot { it.id == decision.leave.id },
                        message = if (action == ApprovalAction.Approve) ReviewMessage.APPROVED else ReviewMessage.REJECTED,
                    )
                }
            }
        }
    }

    private fun editDecision(transform: (LeaveDecision) -> LeaveDecision) =
        _uiState.update { state -> state.copy(decision = state.decision?.let(transform)) }

    companion object {
        /** `LeaveDecisionDto.comment` MaxLength. */
        const val COMMENT_MAX = 1000
    }
}
