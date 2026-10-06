package com.schoolapp.feature.staff.detail

import androidx.compose.runtime.Immutable
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.staff.StaffRepository
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffWorkload
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class StaffDetailUiState(
    val isLoading: Boolean = true,
    val detail: StaffDetail? = null,
    val workload: StaffWorkload? = null,
    val error: AppError? = null,
)

@HiltViewModel
class StaffDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: StaffRepository,
) : ViewModel() {

    private val staffId: String = checkNotNull(savedStateHandle["id"]) { "Staff id missing" }

    private val _uiState = MutableStateFlow(StaffDetailUiState())
    val uiState: StateFlow<StaffDetailUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.value = StaffDetailUiState(isLoading = true)
        viewModelScope.launch {
            val workload = async { repository.workload(staffId) }
            _uiState.value = when (val detail = repository.staffMember(staffId)) {
                is AppResult.Failure -> StaffDetailUiState(isLoading = false, error = detail.error)
                is AppResult.Success -> StaffDetailUiState(
                    isLoading = false,
                    detail = detail.data,
                    workload = (workload.await() as? AppResult.Success)?.data,
                )
            }
        }
    }
}
