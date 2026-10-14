package com.schoolapp.feature.fees.staff.paymentlist

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.fees.ledger.FeesLedgerRepository
import com.schoolapp.core.data.fees.ledger.PaymentFilter
import com.schoolapp.core.model.fees.Payment
import com.schoolapp.core.model.fees.PaymentMethod
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

@Immutable
data class PaymentsListUiState(
    val today: String,
    val filter: PaymentFilter,
    val search: String = "",
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val payments: List<Payment>? = null,
)

/** Payments of the branch with date range, method and search filters (default: this month). */
@HiltViewModel
class PaymentsListViewModel @Inject constructor(
    private val repository: FeesLedgerRepository,
    clock: AppClock,
) : ViewModel() {

    private val today = LocalDate.from(clock.now())
    private val defaultFilter = PaymentFilter(from = today.withDayOfMonth(1).toString(), to = today.toString())
    private val _uiState = MutableStateFlow(PaymentsListUiState(today.toString(), defaultFilter))
    val uiState: StateFlow<PaymentsListUiState> = _uiState.asStateFlow()

    private var branchId: String? = null
    private var loadJob: Job? = null

    fun start(branchId: String) {
        if (this.branchId == branchId) return
        this.branchId = branchId
        load(refreshing = false)
    }

    fun refresh() = load(refreshing = true)

    fun retry() = load(refreshing = false)

    fun onFrom(date: String) = applyFilter { it.copy(from = date, to = it.to?.takeIf { to -> to >= date } ?: date) }

    fun onTo(date: String) = applyFilter { it.copy(to = date, from = it.from?.takeIf { from -> from <= date } ?: date) }

    fun onMethod(method: PaymentMethod?) = applyFilter { it.copy(method = method) }

    fun onSearch(text: String) {
        _uiState.update { it.copy(search = text) }
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            delay(SEARCH_DEBOUNCE_MS)
            _uiState.update { it.copy(filter = it.filter.copy(search = text)) }
            fetch(refreshing = false)
        }
    }

    fun clearFilters() {
        _uiState.update { it.copy(filter = defaultFilter, search = "") }
        load(refreshing = false)
    }

    private fun applyFilter(change: (PaymentFilter) -> PaymentFilter) {
        _uiState.update { it.copy(filter = change(it.filter)) }
        load(refreshing = false)
    }

    private fun load(refreshing: Boolean) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch { fetch(refreshing) }
    }

    private suspend fun fetch(refreshing: Boolean) {
        val branch = branchId ?: return
        val filter = _uiState.value.filter
        _uiState.update { it.copy(isLoading = !refreshing, isRefreshing = refreshing, error = null) }
        val result = repository.payments(branch, filter)
        _uiState.update { state ->
            if (state.filter != filter) return@update state
            val idle = state.copy(isLoading = false, isRefreshing = false)
            when (result) {
                is AppResult.Success -> idle.copy(payments = result.data)
                is AppResult.Failure -> idle.copy(error = result.error)
            }
        }
    }

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 350L
    }
}
