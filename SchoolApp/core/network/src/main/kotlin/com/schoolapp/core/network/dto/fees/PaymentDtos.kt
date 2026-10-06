package com.schoolapp.core.network.dto.fees

import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.files.AttachmentDto
import kotlinx.serialization.Serializable

@Serializable
data class PaymentProofDto(
    val id: String,
    val invoiceId: String? = null,
    val invoice: InvoiceRefDto? = null,
    val invoiceNo: String? = null,
    val student: IdNameDto? = null,
    val amountMinor: Long = 0,
    val paidOn: String? = null,
    val method: String? = null,
    val reference: String? = null,
    val file: AttachmentDto? = null,
    val fileUrl: String? = null,
    val status: String? = null,
    val reason: String? = null,
    val submittedBy: IdNameDto? = null,
    val createdAt: String? = null,
)

@Serializable
data class InvoiceRefDto(val id: String? = null, val invoiceNo: String? = null)

@Serializable
data class ProofBodyDto(
    val invoiceId: String,
    val amountMinor: Long,
    val paidOn: String,
    val method: String,
    val reference: String,
    val fileId: String,
)

@Serializable
data class VerifyProofBodyDto(val receivedOn: String? = null, val note: String? = null)

@Serializable
data class PaymentDto(
    val id: String,
    val receiptNo: String? = null,
    val student: IdNameDto? = null,
    val studentId: String? = null,
    val amountMinor: Long = 0,
    val method: String? = null,
    val reference: String? = null,
    val receivedOn: String? = null,
    val cashier: IdNameDto? = null,
    val status: String? = null,
)

@Serializable
data class PaymentBodyDto(
    val studentId: String,
    val amountMinor: Long,
    val method: String,
    val reference: String? = null,
    val receivedOn: String,
    val clientRequestId: String? = null,
)

/** PDF jobs answer with a url (or `fileUrl`) once ready. */
@Serializable
data class FileUrlDto(val url: String? = null, val fileUrl: String? = null, val status: String? = null)

@Serializable
data class OnlineInitiateBodyDto(val invoiceId: String)

@Serializable
data class OnlineInitiateDto(val gateway: String? = null, val redirectUrl: String? = null)
