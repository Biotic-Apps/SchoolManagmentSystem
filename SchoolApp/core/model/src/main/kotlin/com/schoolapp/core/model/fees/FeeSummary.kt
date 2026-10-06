package com.schoolapp.core.model.fees

data class LastPayment(val amountMinor: Long, val paidOn: String?, val receiptNo: String?)

data class NextDue(val amountMinor: Long, val dueDate: String?, val invoiceNo: String?)

/**
 * `GET /students/:id/fee-summary`. [proofUploadEnabled] / [onlineGatewayEnabled] mirror the branch
 * settings `fees.proofUpload` / `fees.onlineGateway` when the server includes them (defaults: on / off).
 */
data class FeeSummary(
    val totalDueMinor: Long,
    val overdueMinor: Long,
    val advanceMinor: Long,
    val lastPayment: LastPayment?,
    val nextDue: NextDue?,
    val currency: String,
    val proofUploadEnabled: Boolean = true,
    val onlineGatewayEnabled: Boolean = false,
)
