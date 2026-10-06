package com.schoolapp.feature.certificates.review

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.certificates.CertificatesRepository
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateDecision
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * Principal / office: certificate requests by status. Approving a leaving or transfer certificate can be
 * blocked by clearance (dues, unreturned items); the card then shows why and the request stays REQUESTED.
 */
@HiltViewModel
class CertificateReviewViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: CertificatesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(CertificateReviewUiState())
    val uiState: StateFlow<CertificateReviewUiState> = _uiState.asStateFlow()

    private var branchId: String? = null
    private var loadJob: Job? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            branchId = session.activeBranchId
            _uiState.update { it.copy(canApprove = session.has(APPROVE_PERMISSION)) }
            load()
        }
    }

    fun retry() = load()

    fun onFilterChange(filter: ReviewFilter) {
        if (filter == _uiState.value.filter) return
        _uiState.update { it.copy(filter = filter, certificates = emptyList(), message = null, actionError = null) }
        load()
    }

    fun approve(id: String) {
        val state = _uiState.value
        if (!state.canApprove || id in state.busyIds) return
        _uiState.update { it.copy(busyIds = it.busyIds + id, actionError = null, message = null) }
        viewModelScope.launch {
            val result = repository.approve(id)
            _uiState.update { current ->
                val base = current.copy(busyIds = current.busyIds - id)
                when (result) {
                    is AppResult.Failure -> base.copy(actionError = id to result.error)
                    is AppResult.Success -> when (val decision = result.data) {
                        is CertificateDecision.Blocked -> base.copy(blocked = base.blocked + (id to decision.clearance))
                        is CertificateDecision.Done -> base.replace(decision.certificate).copy(
                            blocked = base.blocked - id,
                            message = ReviewMessage.APPROVED,
                        )
                    }
                }
            }
        }
    }

    fun openReject(id: String) {
        if (_uiState.value.canApprove) _uiState.update { it.copy(rejectForm = RejectForm(id), message = null) }
    }

    fun onRejectReasonChange(reason: String) = updateReject { it.copy(reason = reason, reasonMissing = false) }

    fun dismissReject() = _uiState.update { if (it.rejectForm?.isSaving == true) it else it.copy(rejectForm = null) }

    fun submitReject() {
        val form = _uiState.value.rejectForm ?: return
        if (form.isSaving) return
        val reason = form.reason.trim()
        if (reason.isEmpty()) {
            updateReject { it.copy(reasonMissing = true) }
            return
        }
        updateReject { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            val result = repository.reject(form.certificateId, reason)
            _uiState.update { current ->
                when (result) {
                    is AppResult.Failure -> current.rejectForm?.let { current.copy(rejectForm = it.copy(isSaving = false, error = result.error)) }
                        ?: current
                    is AppResult.Success -> current.replace(result.data).copy(
                        rejectForm = null,
                        blocked = current.blocked - form.certificateId,
                        message = ReviewMessage.REJECTED,
                    )
                }
            }
        }
    }

    private fun load() {
        loadJob?.cancel()
        val filter = _uiState.value.filter
        _uiState.update { it.copy(isLoading = true, error = null) }
        loadJob = viewModelScope.launch {
            val result = repository.certificates(status = filter.status, branchId = branchId)
            _uiState.update { current ->
                if (current.filter != filter) return@update current
                when (result) {
                    is AppResult.Success -> current.copy(isLoading = false, certificates = result.data)
                    is AppResult.Failure -> current.copy(isLoading = false, error = result.error)
                }
            }
        }
    }

    private fun CertificateReviewUiState.replace(updated: Certificate) =
        copy(certificates = certificates.map { if (it.id == updated.id) updated else it })

    private fun updateReject(transform: (RejectForm) -> RejectForm) =
        _uiState.update { state -> state.rejectForm?.let { state.copy(rejectForm = transform(it)) } ?: state }

    private companion object {
        const val APPROVE_PERMISSION = "certificates.approve"
    }
}
