package com.schoolapp.core.model.fees

data class MethodTotal(val method: PaymentMethod, val amountMinor: Long, val count: Int)

data class CashierTotal(val cashierName: String, val amountMinor: Long, val count: Int)

/** Stored cash count of a closed day. */
data class DayClosing(
    val closedBy: String?,
    val closedAt: String?,
    val cashExpectedMinor: Long,
    val cashCountedMinor: Long,
    val differenceMinor: Long,
    val note: String?,
)

data class DailyCollection(
    val date: String,
    val totalMinor: Long,
    val byMethod: List<MethodTotal>,
    val byCashier: List<CashierTotal>,
    val payments: List<Payment>,
    val closing: DayClosing? = null,
    /** Cash expected in the drawer (sum of cash payments). */
    val cashMinor: Long = 0,
) {
    val closed: Boolean get() = closing != null
}
