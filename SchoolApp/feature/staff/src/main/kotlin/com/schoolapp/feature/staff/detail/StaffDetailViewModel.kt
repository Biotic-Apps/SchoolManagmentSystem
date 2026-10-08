package com.schoolapp.feature.staff.detail

import androidx.compose.runtime.Immutable
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.staff.StaffAdminRepository
import com.schoolapp.core.data.staff.StaffRepository
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffOptions
import com.schoolapp.core.model.staff.StaffStatusChange
import com.schoolapp.core.model.staff.StaffWorkload
import com.schoolapp.feature.staff.common.StaffEvents
import com.schoolapp.feature.staff.common.StaffPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class StaffDetailUiState(
    val isLoading: Boolean = true,
    val detail: StaffDetail? = null,
    val workload: StaffWorkload? = null,
    val error: AppError? = null,
    /** `staff.edit` (principal, super admin): edit details, change status, assign classes. */
    val canEdit: Boolean = false,
    val canAllocate: Boolean = false,
    /** The API refuses changing your own status. */
    val isSelf: Boolean = false,
    val statusChange: StatusChangeState? = null,
) {
    val isActiveRecord: Boolean get() = detail?.summary?.status !in StaffOptions.LEAVING_STATUSES

    val canChangeStatus: Boolean get() = canEdit && !isSelf

    val canAssign: Boolean get() = canAllocate && isActiveRecord && detail?.summary?.branchId != null
}

@HiltViewModel
class StaffDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: StaffRepository,
    private val adminRepository: StaffAdminRepository,
    private val authRepository: AuthRepository,
    private val events: StaffEvents,
    private val clock: AppClock,
) : ViewModel() {

    private val staffId: String = checkNotNull(savedStateHandle["id"]) { "Staff id missing" }

    private val _uiState = MutableStateFlow(StaffDetailUiState())
    val uiState: StateFlow<StaffDetailUiState> = _uiState.asStateFlow()

    init {
        load()
        viewModelScope.launch { events.changes.drop(1).collect { reload(quiet = true) } }
    }

    fun load() = reload(quiet = false)

    private fun reload(quiet: Boolean) {
        if (!quiet) _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val workload = async { repository.workload(staffId) }
            when (val detail = repository.staffMember(staffId)) {
                is AppResult.Failure -> if (!quiet || _uiState.value.detail == null) {
                    _uiState.update { it.copy(isLoading = false, error = detail.error) }
                }
                is AppResult.Success -> _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = null,
                        detail = detail.data,
                        workload = (workload.await() as? AppResult.Success)?.data,
                        canEdit = StaffPermissions.canEdit(session),
                        canAllocate = StaffPermissions.canAllocate(session),
                        isSelf = detail.data.summary.userId != null && detail.data.summary.userId == session.user.id,
                    )
                }
            }
        }
    }

    fun openStatusChange() = _uiState.update {
        val current = it.detail?.summary?.status ?: return@update it
        it.copy(statusChange = StatusChangeState(current = current, effectiveDate = clock.now().toLocalDate().toString()))
    }

    fun closeStatusChange() = _uiState.update { if (it.statusChange?.isSaving == true) it else it.copy(statusChange = null) }

    fun onStatus(status: String) = updateSheet { it.copy(status = status, statusMissing = false, error = null) }

    fun onEffectiveDate(date: String) = updateSheet { it.copy(effectiveDate = date) }

    fun onReason(reason: String) = updateSheet { it.copy(reason = reason, reasonInvalid = false, error = null) }

    fun submitStatusChange() {
        val sheet = _uiState.value.statusChange ?: return
        if (sheet.isSaving) return
        val status = sheet.status
        val reason = sheet.reason.trim()
        val reasonInvalid = reason.length !in StatusChangeState.REASON_MIN..StatusChangeState.REASON_MAX
        if (status == null || reasonInvalid) return updateSheet { it.copy(statusMissing = status == null, reasonInvalid = reasonInvalid) }
        updateSheet { it.copy(isSaving = true, error = null) }
        viewModelScope.launch {
            when (val result = adminRepository.setStatus(staffId, StaffStatusChange(status, sheet.effectiveDate, reason))) {
                is AppResult.Failure -> updateSheet { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> {
                    _uiState.update { it.copy(detail = result.data, statusChange = null) }
                    events.changed()
                }
            }
        }
    }

    private fun updateSheet(change: (StatusChangeState) -> StatusChangeState) = _uiState.update { state ->
        state.statusChange?.let { state.copy(statusChange = change(it)) } ?: state
    }
}
