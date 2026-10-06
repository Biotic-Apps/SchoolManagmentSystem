package com.schoolapp.feature.admissions.detail

import androidx.compose.runtime.Immutable
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.admissions.AdmissionsRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.AdmissionDecision
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class ApplicationDetailUiState(
    val isLoading: Boolean = true,
    val application: AdmissionApplication? = null,
    val loadError: AppError? = null,
    val canApprove: Boolean = false,
    val pendingDecision: AdmissionDecision? = null,
    val reason: String = "",
    val reasonMissing: Boolean = false,
    val isDeciding: Boolean = false,
    val decideError: AppError? = null,
    val decided: Boolean = false,
) {
    val showActions: Boolean get() = canApprove && application?.status?.isDecidable == true
}

@HiltViewModel
class ApplicationDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: AdmissionsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val applicationId: String = checkNotNull(savedStateHandle["id"]) { "Application id missing" }

    private val _uiState = MutableStateFlow(ApplicationDetailUiState())
    val uiState: StateFlow<ApplicationDetailUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.application == null, loadError = null) }
        viewModelScope.launch {
            val canApprove = authRepository.session.first()?.has(APPROVE_PERMISSION) == true
            when (val result = repository.application(applicationId)) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, application = result.data, canApprove = canApprove) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = result.error) }
            }
        }
    }

    fun onDecisionRequested(decision: AdmissionDecision) =
        _uiState.update { it.copy(pendingDecision = decision, reason = "", reasonMissing = false, decideError = null) }

    fun onReasonChange(value: String) = _uiState.update { it.copy(reason = value, reasonMissing = false) }

    fun onDecisionDismissed() = _uiState.update { if (it.isDeciding) it else it.copy(pendingDecision = null) }

    fun confirmDecision() {
        val state = _uiState.value
        val decision = state.pendingDecision ?: return
        if (state.isDeciding) return
        if (decision == AdmissionDecision.REJECT && state.reason.isBlank()) {
            _uiState.update { it.copy(reasonMissing = true) }
            return
        }
        _uiState.update { it.copy(isDeciding = true, decideError = null) }
        viewModelScope.launch {
            when (val result = repository.decide(applicationId, decision, state.reason)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(isDeciding = false, pendingDecision = null, decided = true) }
                    load()
                }
                is AppResult.Failure -> _uiState.update { it.copy(isDeciding = false, pendingDecision = null, decideError = result.error) }
            }
        }
    }

    private companion object {
        const val APPROVE_PERMISSION = "admissions.approve"
    }
}
