package com.schoolapp.feature.pickup.departure

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.pickup.PickupRepository
import com.schoolapp.core.model.pickup.DepartureInput
import com.schoolapp.core.model.pickup.DepartureOutcome
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Gate: choose who collects the student and record the departure; an unauthorized picker is blocked. */
@HiltViewModel
class RecordDepartureViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val pickupRepository: PickupRepository,
) : ViewModel() {

    private val earlyLeaveId: String? = savedStateHandle["earlyLeaveId"]

    private val _uiState = MutableStateFlow(
        RecordDepartureUiState(
            studentId = checkNotNull(savedStateHandle["studentId"]) { "Student id missing" },
            studentName = savedStateHandle["studentName"],
            leaveTime = savedStateHandle["leaveTime"],
        ),
    )
    val uiState: StateFlow<RecordDepartureUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            when (val result = pickupRepository.pickers(_uiState.value.studentId)) {
                is AppResult.Success -> _uiState.update { state ->
                    val pickers = result.data.sortedByDescending { it.verified }
                    state.copy(isLoading = false, pickers = pickers, selectedPickerId = state.selectedPickerId?.takeIf { id -> pickers.any { it.id == id } })
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
        }
    }

    fun onPickerSelected(id: String) {
        val state = _uiState.value
        if (state.isSaving || state.blocked != null || state.recorded != null) return
        _uiState.update { it.copy(selectedPickerId = id, saveError = null) }
    }

    /** Leaves the blocked state so the gate can pick someone else. */
    fun chooseAnother() = _uiState.update { it.copy(blocked = null, selectedPickerId = null, saveError = null) }

    fun confirm() {
        val state = _uiState.value
        val picker = state.selectedPicker ?: return
        if (state.isSaving || state.blocked != null || state.recorded != null) return
        _uiState.update { it.copy(isSaving = true, saveError = null) }
        val input = DepartureInput(
            studentId = state.studentId,
            earlyLeaveId = earlyLeaveId,
            pickupPersonId = picker.id.takeUnless { picker.isGuardian },
            guardianId = picker.id.takeIf { picker.isGuardian },
        )
        viewModelScope.launch {
            when (val result = pickupRepository.recordDeparture(input)) {
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, saveError = result.error) }
                is AppResult.Success -> when (val outcome = result.data) {
                    is DepartureOutcome.Recorded -> _uiState.update { it.copy(isSaving = false, recorded = outcome.departure) }
                    is DepartureOutcome.Blocked -> _uiState.update {
                        it.copy(isSaving = false, blocked = BlockedPickup(picker.id, picker.name, outcome.message))
                    }
                }
            }
        }
    }
}
