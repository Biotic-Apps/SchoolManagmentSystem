package com.schoolapp.feature.staff.probation

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.staff.assignments.StaffAssignmentsRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.assignments.NewStaffAssignment
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.staff.common.StaffEvents
import com.schoolapp.feature.staff.common.StaffPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProbationUiState(
    /** `staff.edit` while acting as principal or super admin (the API refuses everyone else). */
    val canSet: Boolean = false,
    val sheet: ProbationState? = null,
    /** One-shot success message key: true = review turned on, false = off. */
    val savedOn: Boolean? = null,
)

/** Turns probation review on/off for a staff member and picks who reviews their work. */
@HiltViewModel
class ProbationViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: StaffAssignmentsRepository,
    authRepository: AuthRepository,
    private val events: StaffEvents,
) : ViewModel() {

    private val staffId: String = checkNotNull(savedStateHandle["id"]) { "Staff id missing" }

    private val _uiState = MutableStateFlow(ProbationUiState())
    val uiState: StateFlow<ProbationUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.session.collect { session ->
                val role = session?.activeRole?.key
                val canSet = StaffPermissions.canEdit(session) && (role == RoleKey.PRINCIPAL.key || role == RoleKey.SUPER_ADMIN.key)
                _uiState.update { it.copy(canSet = canSet) }
            }
        }
    }

    fun open(detail: StaffDetail) {
        val s = detail.summary
        _uiState.update { it.copy(sheet = ProbationState(s.name, s.requiresReview, s.reviewerUserId)) }
        loadReviewers(detail)
    }

    fun retryReviewers(detail: StaffDetail) = loadReviewers(detail)

    private fun loadReviewers(detail: StaffDetail) {
        val branchId = detail.summary.branchId ?: return updateSheet { it.copy(reviewersLoading = false) }
        updateSheet { it.copy(reviewersLoading = true, reviewersError = null) }
        viewModelScope.launch {
            when (val result = repository.activeStaff(branchId)) {
                is AppResult.Failure -> updateSheet { it.copy(reviewersLoading = false, reviewersError = result.error) }
                is AppResult.Success -> {
                    val options = result.data
                        .filter { it.id != staffId && it.userId != null && it.roles.any { r -> r in NewStaffAssignment.REVIEWER_ROLES } }
                        .map { m ->
                            val roles = m.roles.filter { it in NewStaffAssignment.REVIEWER_ROLES }.joinToString(", ") { humanizeKey(it) }
                            SwitcherOption(m.userId!!, m.name, roles)
                        }
                    updateSheet { it.copy(reviewersLoading = false, reviewers = options) }
                }
            }
        }
    }

    fun onRequiresReview(on: Boolean) = updateSheet { it.copy(requiresReview = on, reviewerMissing = false, error = null) }

    fun onReviewer(userId: String) = updateSheet { it.copy(reviewerUserId = userId, reviewerMissing = false, error = null) }

    fun dismiss() = _uiState.update { if (it.sheet?.isSaving == true) it else it.copy(sheet = null) }

    fun consumeSaved() = _uiState.update { it.copy(savedOn = null) }

    fun submit() {
        val sheet = _uiState.value.sheet ?: return
        if (sheet.isSaving) return
        if (sheet.requiresReview && sheet.reviewerUserId.isNullOrBlank()) return updateSheet { it.copy(reviewerMissing = true) }
        updateSheet { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.setProbation(staffId, sheet.requiresReview, sheet.reviewerUserId)) {
                is AppResult.Failure -> updateSheet { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> {
                    _uiState.update { it.copy(sheet = null, savedOn = sheet.requiresReview) }
                    events.changed()
                }
            }
        }
    }

    private fun updateSheet(change: (ProbationState) -> ProbationState) = _uiState.update { state ->
        state.sheet?.let { state.copy(sheet = change(it)) } ?: state
    }
}
