package com.schoolapp.feature.fees.staff.today

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.model.fees.DailyCollection
import com.schoolapp.feature.fees.staff.payments.PaymentActionRules
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Accountant/principal: finance overview tiles and today's collection for the active branch. */
@HiltViewModel
class TodayViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val repository: FeesRepository,
    clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(TodayUiState(today = clock.now().toLocalDate().toString()))
    val uiState: StateFlow<TodayUiState> = _uiState.asStateFlow()

    private var branchId: String? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            branchId = session.activeBranchId
            _uiState.update { it.copy(canRecord = session.has(FEES_ADD), canCloseDay = session.has(FEES_APPROVE) && branchId != null) }
            load()
        }
        viewModelScope.launch { repository.queuedPayments.collect { count -> _uiState.update { it.copy(queuedPayments = count) } } }
    }

    fun openCloseDay() {
        if (_uiState.value.showCloseDay) _uiState.update { it.copy(closeForm = CloseDayForm()) }
    }

    fun dismissCloseDay() {
        if (_uiState.value.closeForm?.isSaving != true) _uiState.update { it.copy(closeForm = null) }
    }

    fun onCashChange(text: String) = updateForm { it.copy(cash = text, cashInvalid = false) }

    fun onNoteChange(text: String) = updateForm { it.copy(note = text.take(MAX_NOTE)) }

    fun submitCloseDay() = updateForm {
        val valid = PaymentActionRules.cashCounted(it.cash) != null
        it.copy(cashInvalid = !valid, confirming = valid, error = null)
    }

    fun cancelCloseConfirm() = updateForm { it.copy(confirming = false) }

    fun confirmCloseDay() {
        val form = _uiState.value.closeForm ?: return
        val cash = PaymentActionRules.cashCounted(form.cash) ?: return
        if (!form.confirming || form.isSaving) return
        updateForm { it.copy(confirming = false, isSaving = true) }
        viewModelScope.launch {
            when (val result = repository.closeDay(_uiState.value.today, cash, form.note, branchId)) {
                is AppResult.Success -> _uiState.update { it.copy(closeForm = null, collection = result.data.withPaymentsFrom(it.collection)) }
                is AppResult.Failure -> updateForm { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    private fun updateForm(transform: (CloseDayForm) -> CloseDayForm) =
        _uiState.update { state -> state.closeForm?.let { state.copy(closeForm = transform(it)) } ?: state }

    fun retry() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch { load() }
    }

    fun refresh() {
        _uiState.update { it.copy(isRefreshing = true) }
        viewModelScope.launch { load() }
    }

    private suspend fun load() {
        val date = _uiState.value.today
        val (overview, collection) = coroutineScope {
            val overview = async { repository.financeOverview(branchId) }
            val collection = async { repository.dailyCollection(date, branchId) }
            overview.await() to collection.await()
        }
        _uiState.update {
            it.copy(
                isLoading = false,
                isRefreshing = false,
                error = (overview as? AppResult.Failure)?.error ?: (collection as? AppResult.Failure)?.error,
                overview = (overview as? AppResult.Success)?.data ?: it.overview,
                collection = (collection as? AppResult.Success)?.data ?: it.collection,
            )
        }
    }

    private companion object {
        const val FEES_ADD = "fees.add"
        const val FEES_APPROVE = "fees.approve"
        const val MAX_NOTE = 500
    }
}

/** The close response carries the same day; keep already loaded rows if it comes back without them. */
private fun DailyCollection.withPaymentsFrom(previous: DailyCollection?): DailyCollection =
    if (payments.isEmpty() && previous != null) copy(payments = previous.payments, byMethod = previous.byMethod, byCashier = previous.byCashier) else this
