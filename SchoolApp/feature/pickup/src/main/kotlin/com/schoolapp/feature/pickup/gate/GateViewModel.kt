package com.schoolapp.feature.pickup.gate

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.data.pickup.PickupRepository
import com.schoolapp.core.model.pickup.EarlyLeave
import com.schoolapp.feature.pickup.components.StudentSearch
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Branch early leaves and departures for today; refreshed whenever the screen resumes (after recording). */
@HiltViewModel
class GateViewModel @Inject constructor(
    private val pickupRepository: PickupRepository,
    studentsRepository: StudentsRepository,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(GateUiState())
    val uiState: StateFlow<GateUiState> = _uiState.asStateFlow()

    private val search = StudentSearch(viewModelScope, studentsRepository) { transform ->
        _uiState.update { it.copy(search = transform(it.search)) }
    }

    fun refresh() {
        val today = clock.now().toLocalDate().toString()
        _uiState.update {
            val hasData = it.earlyLeaves.isNotEmpty() || it.departures.isNotEmpty()
            it.copy(isLoading = !hasData, isRefreshing = hasData, error = null, today = today)
        }
        viewModelScope.launch {
            val session = authRepository.session.first()
            val branchId = session?.activeBranchId
            val leaves = async { pickupRepository.earlyLeaves(branchId = branchId, date = today) }
            val departures = async { pickupRepository.departures(branchId = branchId, date = today) }
            val leavesResult = leaves.await()
            val departuresResult = departures.await()
            _uiState.update { state ->
                val base = state.copy(isLoading = false, isRefreshing = false, canEdit = session?.has(EDIT_PERMISSION) == true)
                when {
                    leavesResult is AppResult.Failure -> base.copy(error = leavesResult.error)
                    departuresResult is AppResult.Failure -> base.copy(error = departuresResult.error)
                    else -> base.copy(
                        earlyLeaves = (leavesResult as AppResult.Success).data.sortedBy(EarlyLeave::time),
                        departures = (departuresResult as AppResult.Success).data.sortedByDescending { it.at },
                    )
                }
            }
        }
    }

    fun onQueryChange(query: String) = search.onQueryChange(query)

    fun approve(id: String) = decide(id) { pickupRepository.approveEarlyLeave(it) }

    fun reject(id: String) = decide(id) { pickupRepository.rejectEarlyLeave(it) }

    private fun decide(id: String, call: suspend (String) -> AppResult<EarlyLeave>) {
        if (_uiState.value.busyLeaveId != null) return
        _uiState.update { it.copy(busyLeaveId = id, actionError = null) }
        viewModelScope.launch {
            when (val result = call(id)) {
                is AppResult.Success -> _uiState.update { state ->
                    state.copy(busyLeaveId = null, earlyLeaves = state.earlyLeaves.map { if (it.id == id) result.data else it })
                }
                is AppResult.Failure -> _uiState.update { it.copy(busyLeaveId = null, actionError = result.error) }
            }
        }
    }

    private companion object {
        const val EDIT_PERMISSION = "pickup.edit"
    }
}
