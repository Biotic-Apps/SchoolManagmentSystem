package com.schoolapp.core.network.dto.fees

import kotlinx.serialization.Serializable

@Serializable
data class LastPaymentDto(val amountMinor: Long = 0, val paidOn: String? = null, val receiptNo: String? = null)

@Serializable
data class NextDueDto(
    val balanceMinor: Long? = null,
    val amountMinor: Long? = null,
    val dueDate: String? = null,
    val invoiceNo: String? = null,
    val invoiceId: String? = null,
)

/** [proofUpload] / [onlineGateway] are optional extras mirroring the branch fee settings. */
@Serializable
data class FeeSummaryDto(
    val totalDueMinor: Long = 0,
    val overdueMinor: Long = 0,
    val advanceMinor: Long = 0,
    val lastPayment: LastPaymentDto? = null,
    val nextDue: NextDueDto? = null,
    val currency: String? = null,
    val proofUpload: Boolean? = null,
    val onlineGateway: String? = null,
    val proofUploadEnabled: Boolean? = null,
    val onlineGatewayEnabled: Boolean? = null,
)
