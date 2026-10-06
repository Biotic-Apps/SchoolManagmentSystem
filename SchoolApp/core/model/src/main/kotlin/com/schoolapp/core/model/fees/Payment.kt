package com.schoolapp.core.model.fees

enum class PaymentMethod { CASH, BANK, CHEQUE, ONLINE }

data class Payment(
    val id: String,
    val receiptNo: String?,
    val studentId: String?,
    val studentName: String?,
    val amountMinor: Long,
    val method: PaymentMethod,
    val reference: String?,
    val receivedOn: String?,
    val cashierName: String?,
    val status: String?,
)

data class PaymentInput(
    val studentId: String,
    val amountMinor: Long,
    val method: PaymentMethod,
    val reference: String?,
    val receivedOn: String,
)

sealed interface PaymentOutcome {
    data class Recorded(val payment: Payment) : PaymentOutcome

    /** Offline: queued with its clientRequestId; the receipt number arrives after sync. */
    data object Queued : PaymentOutcome
}
