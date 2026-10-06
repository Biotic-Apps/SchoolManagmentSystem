package com.schoolapp.core.model.fees

enum class InvoiceStatus { DRAFT, ISSUED, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED }

data class InvoiceLine(val id: String, val feeHeadName: String, val description: String?, val amountMinor: Long)

data class InvoicePayment(val paymentId: String, val receiptNo: String?, val amountMinor: Long, val paidOn: String?)

/** Amounts are integer minor units of [currency] (never floats). */
data class Invoice(
    val id: String,
    val invoiceNo: String,
    val studentId: String?,
    val studentName: String,
    val admissionNo: String?,
    val className: String?,
    val sectionName: String?,
    val period: String?,
    val issueDate: String?,
    val dueDate: String?,
    val status: InvoiceStatus,
    val lines: List<InvoiceLine>,
    val concessionMinor: Long,
    val lateFeeMinor: Long,
    val totalMinor: Long,
    val paidMinor: Long,
    val balanceMinor: Long,
    val payments: List<InvoicePayment>,
    val currency: String,
) {
    val isPayable: Boolean get() = balanceMinor > 0 && status != InvoiceStatus.CANCELLED && status != InvoiceStatus.DRAFT
}
