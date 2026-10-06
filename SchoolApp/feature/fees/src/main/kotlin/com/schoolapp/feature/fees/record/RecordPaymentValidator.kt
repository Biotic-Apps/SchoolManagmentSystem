package com.schoolapp.feature.fees.record

import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.fees.PaymentMethod
import java.time.LocalDate
import java.time.format.DateTimeParseException

enum class PaymentIssue { STUDENT_REQUIRED, AMOUNT_REQUIRED, AMOUNT_INVALID, AMOUNT_NOT_POSITIVE, REFERENCE_REQUIRED, DATE_REQUIRED, DATE_IN_FUTURE }

/** Pure rules for a counter payment: student, positive amount, reference for bank/cheque, date not in the future. */
object RecordPaymentValidator {
    fun validate(
        studentId: String?,
        amountText: String,
        method: PaymentMethod,
        reference: String,
        receivedOn: String,
        today: LocalDate,
    ): Set<PaymentIssue> = buildSet {
        if (studentId.isNullOrBlank()) add(PaymentIssue.STUDENT_REQUIRED)
        val amount = MoneyFormat.parse(amountText)
        when {
            amountText.isBlank() -> add(PaymentIssue.AMOUNT_REQUIRED)
            amount == null -> add(PaymentIssue.AMOUNT_INVALID)
            amount <= 0L -> add(PaymentIssue.AMOUNT_NOT_POSITIVE)
        }
        if (requiresReference(method) && reference.isBlank()) add(PaymentIssue.REFERENCE_REQUIRED)
        val date = try {
            LocalDate.parse(receivedOn)
        } catch (e: DateTimeParseException) {
            null
        }
        when {
            date == null -> add(PaymentIssue.DATE_REQUIRED)
            date.isAfter(today) -> add(PaymentIssue.DATE_IN_FUTURE)
        }
    }

    fun requiresReference(method: PaymentMethod): Boolean = method == PaymentMethod.BANK || method == PaymentMethod.CHEQUE
}
