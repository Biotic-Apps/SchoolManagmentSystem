package com.schoolapp.core.network.dto.fees

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class InvoiceStudentDto(
    val id: String? = null,
    val name: String? = null,
    val admissionNo: String? = null,
    val className: String? = null,
    val sectionName: String? = null,
)

@Serializable
data class InvoiceLineDto(
    val id: String = "",
    val feeHead: IdNameDto? = null,
    val description: String? = null,
    val amountMinor: Long = 0,
)

@Serializable
data class InvoicePaymentDto(
    val paymentId: String = "",
    val receiptNo: String? = null,
    val amountMinor: Long = 0,
    val paidOn: String? = null,
)

@Serializable
data class InvoiceDto(
    val id: String,
    val invoiceNo: String = "",
    val student: InvoiceStudentDto? = null,
    val period: String? = null,
    val issueDate: String? = null,
    val dueDate: String? = null,
    val status: String? = null,
    val lines: List<InvoiceLineDto> = emptyList(),
    val concessionMinor: Long = 0,
    val lateFeeMinor: Long = 0,
    val totalMinor: Long = 0,
    val paidMinor: Long = 0,
    val balanceMinor: Long = 0,
    val payments: List<InvoicePaymentDto> = emptyList(),
    val currency: String? = null,
)
