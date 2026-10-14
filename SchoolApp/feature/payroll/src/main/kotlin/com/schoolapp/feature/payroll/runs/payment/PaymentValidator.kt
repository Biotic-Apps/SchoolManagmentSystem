package com.schoolapp.feature.payroll.runs.payment

import com.schoolapp.core.designsystem.money.MoneyFormat
import java.time.LocalDate
import java.time.format.DateTimeParseException

enum class PaymentIssue { AMOUNT_REQUIRED, AMOUNT_INVALID, AMOUNT_NOT_POSITIVE, AMOUNT_OVER_BALANCE, METHOD_REQUIRED, DATE_REQUIRED, DATE_IN_FUTURE, REFERENCE_TOO_LONG }

/** Salary payment rules: positive amount up to the balance, a method, a paid-on date not in the future. */
object PaymentValidator {
    const val REFERENCE_MAX = 80

    fun validate(form: PaymentForm, balanceMinor: Long, today: LocalDate): Set<PaymentIssue> = buildSet {
        val amount = MoneyFormat.parse(form.amount)
        when {
            form.amount.isBlank() -> add(PaymentIssue.AMOUNT_REQUIRED)
            amount == null -> add(PaymentIssue.AMOUNT_INVALID)
            amount <= 0L -> add(PaymentIssue.AMOUNT_NOT_POSITIVE)
            amount > balanceMinor -> add(PaymentIssue.AMOUNT_OVER_BALANCE)
        }
        if (form.method == null) add(PaymentIssue.METHOD_REQUIRED)
        val date = try {
            LocalDate.parse(form.paidOn)
        } catch (e: DateTimeParseException) {
            null
        }
        when {
            date == null -> add(PaymentIssue.DATE_REQUIRED)
            date.isAfter(today) -> add(PaymentIssue.DATE_IN_FUTURE)
        }
        if (form.reference.trim().length > REFERENCE_MAX) add(PaymentIssue.REFERENCE_TOO_LONG)
    }
}
