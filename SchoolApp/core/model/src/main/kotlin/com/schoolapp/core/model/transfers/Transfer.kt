package com.schoolapp.core.model.transfers

/** A student transfer between two branches of the school. */
data class Transfer(
    val id: String,
    val studentId: String?,
    val studentName: String,
    val admissionNo: String?,
    val fromBranchId: String?,
    val fromBranchName: String?,
    val toBranchId: String?,
    val toBranchName: String?,
    val effectiveDate: String?,
    val reason: String?,
    val status: TransferStatus,
    val decisionReason: String?,
    val createdAt: String?,
)

enum class TransferStatus {
    REQUESTED, ACCEPTED, REJECTED, CANCELLED, UNKNOWN;

    companion object {
        fun from(key: String?): TransferStatus = entries.firstOrNull { it.name == key?.uppercase() } ?: UNKNOWN
    }
}

/** IN: to this branch; OUT: from this branch; null: both. */
enum class TransferDirection { IN, OUT }

data class TransferFilter(val direction: TransferDirection? = TransferDirection.IN, val status: TransferStatus? = null)
