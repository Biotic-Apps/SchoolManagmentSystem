package com.schoolapp.feature.fees.staff.payments

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.fees.Payment
import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.core.model.fees.RefundInput
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Receipt, refund (`fees.add`) and reversal (`fees.edit`) of one payment; money actions are confirmed first. */
@HiltViewModel
class PaymentActionsViewModel @Inject constructor(
    authRepository: AuthRepository,
    private val repository: FeesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(PaymentActionsUiState())
    val uiState: StateFlow<PaymentActionsUiState> = _uiState.asStateFlow()

    /** Bumped after a successful action so the payment list reloads. */
    private val _changes = MutableStateFlow(0)
    val changes: StateFlow<Int> = _changes.asStateFlow()

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _uiState.update { it.copy(canReverse = session.has(FEES_EDIT), canRefund = session.has(FEES_ADD)) }
        }
    }

    fun open(payment: Payment) = _uiState.update { it.copy(sheet = PaymentSheet(payment), notice = null) }

    fun dismiss() {
        if (_uiState.value.sheet?.isSaving == true) return
        _uiState.update { it.copy(sheet = null) }
    }

    fun choose(action: PaymentAction?) {
        val state = _uiState.value
        val sheet = state.sheet ?: return
        val allowed = when (action) {
            null -> true
            PaymentAction.REVERSE -> state.canReverse && sheet.payment.isActive
            PaymentAction.REFUND -> state.canRefund && sheet.payment.isActive
        }
        if (!allowed) return
        val amount = if (action == PaymentAction.REFUND) MoneyFormat.toInput(sheet.payment.amountMinor) else ""
        updateSheet { PaymentSheet(it.payment, action = action, amount = amount) }
    }

    fun onReasonChange(text: String) = updateSheet { it.copy(reason = text.take(PaymentActionRules.MAX_REASON), issues = emptySet()) }

    fun onAmountChange(text: String) = updateSheet { it.copy(amount = text, issues = emptySet()) }

    fun onMethodChange(method: PaymentMethod) = updateSheet { it.copy(method = method) }

    /** Validates, then asks for confirmation. */
    fun submit() {
        val sheet = _uiState.value.sheet ?: return
        val issues = when (sheet.action) {
            PaymentAction.REVERSE -> PaymentActionRules.reason(sheet.reason)
            PaymentAction.REFUND -> PaymentActionRules.refund(sheet.amount, sheet.reason, sheet.payment.amountMinor)
            null -> return
        }
        updateSheet { it.copy(issues = issues, confirming = issues.isEmpty(), error = null) }
    }

    fun cancelConfirm() = updateSheet { it.copy(confirming = false) }

    fun confirm() {
        val sheet = _uiState.value.sheet ?: return
        if (!sheet.confirming || sheet.isSaving) return
        updateSheet { it.copy(confirming = false, isSaving = true, error = null) }
        viewModelScope.launch {
            val payment = sheet.payment
            val result: AppResult<*> = when (sheet.action) {
                PaymentAction.REVERSE -> repository.reversePayment(payment.id, sheet.reason)
                PaymentAction.REFUND -> repository.requestRefund(
                    RefundInput(payment.id, MoneyFormat.parse(sheet.amount) ?: 0, sheet.method, sheet.reason),
                )
                null -> return@launch
            }
            when (result) {
                is AppResult.Success -> {
                    val notice = if (sheet.action == PaymentAction.REVERSE) PaymentNotice.REVERSAL_SENT else PaymentNotice.REFUND_SENT
                    _uiState.update { it.copy(sheet = null, notice = notice) }
                    _changes.update { it + 1 }
                }
                is AppResult.Failure -> updateSheet { it.copy(isSaving = false, error = result.error) }
            }
        }
    }

    fun openReceipt() {
        val sheet = _uiState.value.sheet ?: return
        if (sheet.isOpeningReceipt) return
        updateSheet { it.copy(isOpeningReceipt = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.receiptUrl(sheet.payment.id)) {
                is AppResult.Success -> _uiState.update { state ->
                    state.copy(openUrl = result.data, sheet = state.sheet?.copy(isOpeningReceipt = false))
                }
                is AppResult.Failure -> updateSheet { it.copy(isOpeningReceipt = false, error = result.error) }
            }
        }
    }

    fun onUrlOpened() = _uiState.update { it.copy(openUrl = null) }

    fun clearNotice() = _uiState.update { it.copy(notice = null) }

    private fun updateSheet(transform: (PaymentSheet) -> PaymentSheet) =
        _uiState.update { state -> state.sheet?.let { state.copy(sheet = transform(it)) } ?: state }

    private companion object {
        const val FEES_ADD = "fees.add"
        const val FEES_EDIT = "fees.edit"
    }
}
