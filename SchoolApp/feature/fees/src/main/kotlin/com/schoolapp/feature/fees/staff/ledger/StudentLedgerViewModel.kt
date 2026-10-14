package com.schoolapp.feature.fees.staff.ledger

import androidx.compose.runtime.Immutable
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.data.fees.ledger.FeesLedgerRepository
import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.model.fees.ledger.StudentLedger
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class StudentLedgerUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val ledger: StudentLedger? = null,
    val summary: FeeSummary? = null,
)

/** One student's fee summary and every charge, payment and credit with the running balance. */
@HiltViewModel
class StudentLedgerViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: FeesLedgerRepository,
    private val fees: FeesRepository,
) : ViewModel() {

    private val studentId = savedStateHandle.toRoute<StudentLedgerDestination>().studentId
    private val _uiState = MutableStateFlow(StudentLedgerUiState())
    val uiState: StateFlow<StudentLedgerUiState> = _uiState.asStateFlow()

    init {
        load(refreshing = false)
    }

    fun refresh() = load(refreshing = true)

    fun retry() = load(refreshing = false)

    private fun load(refreshing: Boolean) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
            val summary = async { fees.feeSummary(studentId) }
            val ledger = repository.ledger(studentId)
            val summaryResult = summary.await()
            _uiState.update { state ->
                val idle = state.copy(
                    isLoading = false,
                    isRefreshing = false,
                    summary = (summaryResult as? AppResult.Success)?.data ?: state.summary,
                )
                when (ledger) {
                    is AppResult.Success -> idle.copy(ledger = ledger.data)
                    is AppResult.Failure -> idle.copy(error = ledger.error)
                }
            }
        }
    }
}
