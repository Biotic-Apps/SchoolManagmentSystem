package com.schoolapp.core.model.fees

data class MethodTotal(val method: PaymentMethod, val amountMinor: Long, val count: Int)

data class CashierTotal(val cashierName: String, val amountMinor: Long, val count: Int)

data class DailyCollection(
    val date: String,
    val totalMinor: Long,
    val byMethod: List<MethodTotal>,
    val byCashier: List<CashierTotal>,
    val payments: List<Payment>,
    val closed: Boolean,
)
