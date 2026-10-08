package com.schoolapp.core.model.fees

enum class ProofStatus { SUBMITTED, VERIFIED, REJECTED }

enum class ProofMethod { BANK, WALLET, OTHER }

data class PaymentProof(
    val id: String,
    val invoiceId: String?,
    val invoiceNo: String?,
    val studentName: String?,
    val amountMinor: Long,
    val paidOn: String?,
    val method: ProofMethod,
    val reference: String?,
    val fileUrl: String?,
    val fileMime: String?,
    val status: ProofStatus,
    val reason: String?,
    val submittedBy: String?,
    val createdAt: String?,
    val studentId: String? = null,
    val note: String? = null,
)

data class ProofInput(
    val invoiceId: String,
    val amountMinor: Long,
    val paidOn: String,
    val method: ProofMethod,
    val reference: String,
    val fileId: String,
)
