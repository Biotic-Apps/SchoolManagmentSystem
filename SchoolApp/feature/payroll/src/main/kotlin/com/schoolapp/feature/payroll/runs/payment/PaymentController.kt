package com.schoolapp.feature.payroll.runs.payment

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.payroll.PayrollRepository
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.payroll.PayrollPaymentInput
import com.schoolapp.core.model.payroll.SalaryPaymentMethod
import com.schoolapp.feature.payroll.runs.MonthlyPayrollUiState
import com.schoolapp.feature.payroll.runs.RunNotice
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate

/** "Record payment" for one line (`payroll.edit`, run APPROVED / PARTIALLY_PAID, balance left). */
class PaymentController internal constructor(
    private val scope: CoroutineScope,
    private val repository: PayrollRepository,
    private val state: MutableStateFlow<MonthlyPayrollUiState>,
    private val today: () -> LocalDate,
    private val reload: () -> Unit,
) {
    internal val callbacks: PaymentCallbacks by lazy {
        PaymentCallbacks(::onAmount, ::onPaidOn, ::onMethod, ::onReference, ::submit, ::dismiss)
    }

    /** Latest allowed paid-on date, `YYYY-MM-DD`. */
    fun todayText(): String = today().toString()

    fun open(staffId: String) {
        val s = state.value
        val line = s.line(staffId) ?: return
        if (!s.canPay(line)) return
        state.update {
            it.copy(
                breakdown = null,
                payment = PaymentForm(staffId, MoneyFormat.toInput(line.balanceMinor.coerceAtLeast(0)), today().toString()),
            )
        }
    }

    fun dismiss() {
        if (state.value.payment?.saving != true) state.update { it.copy(payment = null) }
    }

    fun onAmount(value: String) = edit { it.copy(amount = value) }

    fun onPaidOn(value: String) = edit { it.copy(paidOn = value) }

    fun onMethod(value: SalaryPaymentMethod) = edit { it.copy(method = value) }

    fun onReference(value: String) = edit { it.copy(reference = value) }

    /** Issues for the inline errors; empty until the first submit attempt. */
    fun issues(): Set<PaymentIssue> {
        val form = state.value.payment ?: return emptySet()
        if (!form.showErrors) return emptySet()
        return PaymentValidator.validate(form, state.value.line(form.staffId)?.balanceMinor ?: 0, today())
    }

    fun submit() {
        val s = state.value
        val form = s.payment ?: return
        val run = s.run ?: return
        val line = s.line(form.staffId) ?: return
        if (form.saving) return
        val issues = PaymentValidator.validate(form, line.balanceMinor, today())
        if (issues.isNotEmpty()) {
            edit { it.copy(showErrors = true) }
            return
        }
        val input = PayrollPaymentInput(
            staffId = line.staffId,
            amountMinor = MoneyFormat.parse(form.amount) ?: return,
            method = form.method ?: return,
            reference = form.reference,
            paidOn = form.paidOn,
        )
        state.update { it.copy(payment = form.copy(saving = true, error = null, showErrors = true)) }
        scope.launch {
            when (val result = repository.recordPayment(run.id, input)) {
                is AppResult.Success -> {
                    state.update { it.copy(payment = null, notice = RunNotice.PAID, actionError = null) }
                    reload()
                }
                is AppResult.Failure -> edit { it.copy(saving = false, error = result.error) }
            }
        }
    }

    private fun edit(change: (PaymentForm) -> PaymentForm) =
        state.update { s -> s.payment?.let { s.copy(payment = change(it).copy(error = null)) } ?: s }
}
