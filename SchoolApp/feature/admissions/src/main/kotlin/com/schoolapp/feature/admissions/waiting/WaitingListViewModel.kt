package com.schoolapp.feature.admissions.waiting

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.admissions.AdmissionsRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.feature.admissions.R
import com.schoolapp.feature.admissions.common.AdmissionPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class WaitingListUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val applications: List<AdmissionApplication> = emptyList(),
    val error: AppError? = null,
    /** `admissions.approve`: "Offer seat". */
    val canOffer: Boolean = false,
    val offerTarget: AdmissionApplication? = null,
    val offering: Boolean = false,
    val offerError: AppError? = null,
    val notice: Int? = null,
)

/** WAITLISTED applications in queue order; a seat can be offered to any of them (the guardian is notified). */
@HiltViewModel
class WaitingListViewModel @Inject constructor(
    private val repository: AdmissionsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(WaitingListUiState())
    val uiState: StateFlow<WaitingListUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = it.applications.isEmpty() && !it.isRefreshing, error = null) }
        viewModelScope.launch {
            val canOffer = authRepository.session.first()?.has(AdmissionPermissions.APPROVE) == true
            when (val result = repository.waitingList()) {
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, error = result.error, canOffer = canOffer) }
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, isRefreshing = false, applications = result.data, canOffer = canOffer) }
            }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        load()
    }

    fun askOffer(app: AdmissionApplication) = _uiState.update { it.copy(offerTarget = app, offerError = null) }

    fun dismissOffer() = _uiState.update { if (it.offering) it else it.copy(offerTarget = null) }

    fun noticeShown() = _uiState.update { it.copy(notice = null) }

    fun confirmOffer() {
        val target = _uiState.value.offerTarget ?: return
        if (_uiState.value.offering) return
        _uiState.update { it.copy(offering = true, offerError = null) }
        viewModelScope.launch {
            when (val result = repository.offerFromWaitingList(target.id)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(offering = false, offerTarget = null, notice = R.string.admissions_seat_offered) }
                    load()
                }
                is AppResult.Failure -> _uiState.update { it.copy(offering = false, offerTarget = null, offerError = result.error) }
            }
        }
    }
}
