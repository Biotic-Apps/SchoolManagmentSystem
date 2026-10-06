package com.schoolapp.feature.fees.staff.proofs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.model.fees.PaymentProof
import com.schoolapp.core.model.fees.ProofStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Submitted payment proofs waiting for verification; verify/reject needs `fees.approve`. */
@HiltViewModel
class ProofsViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: FeesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProofsUiState())
    val uiState: StateFlow<ProofsUiState> = _uiState.asStateFlow()

    private var branchId: String? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            branchId = session.activeBranchId
            _uiState.update { it.copy(canApprove = session.has(FEES_APPROVE)) }
            load()
        }
    }

    fun retry() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch { load() }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        viewModelScope.launch { load() }
    }

    fun open(proof: PaymentProof) = _uiState.update { it.copy(review = ProofReview(proof), lastDecision = null) }

    fun dismiss() = _uiState.update { if (it.review?.isSaving == true) it else it.copy(review = null) }

    fun choose(decision: ProofDecision?) = updateReview { it.copy(decision = decision, text = "", textMissing = false, error = null) }

    fun onTextChange(text: String) = updateReview { it.copy(text = text, textMissing = false) }

    fun confirm() {
        val review = _uiState.value.review ?: return
        val decision = review.decision ?: return
        if (!_uiState.value.canApprove || review.isSaving) return
        if (decision == ProofDecision.REJECT && review.text.isBlank()) {
            updateReview { it.copy(textMissing = true) }
            return
        }
        updateReview { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            val result = when (decision) {
                ProofDecision.VERIFY -> repository.verifyProof(review.proof.id, review.text.trim().takeIf { it.isNotEmpty() })
                ProofDecision.REJECT -> repository.rejectProof(review.proof.id, review.text.trim())
            }
            when (result) {
                is AppResult.Success -> _uiState.update { state ->
                    state.copy(review = null, lastDecision = decision, proofs = state.proofs.filterNot { it.id == review.proof.id })
                }
                is AppResult.Failure -> updateReview { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    private fun updateReview(change: (ProofReview) -> ProofReview) =
        _uiState.update { state -> state.review?.let { state.copy(review = change(it)) } ?: state }

    private suspend fun load() {
        val result = repository.proofs(status = ProofStatus.SUBMITTED, branchId = branchId)
        _uiState.update {
            when (result) {
                is AppResult.Success -> it.copy(isLoading = false, isRefreshing = false, error = null, proofs = result.data)
                is AppResult.Failure -> it.copy(isLoading = false, isRefreshing = false, error = result.error)
            }
        }
    }

    private companion object {
        const val FEES_APPROVE = "fees.approve"
    }
}
