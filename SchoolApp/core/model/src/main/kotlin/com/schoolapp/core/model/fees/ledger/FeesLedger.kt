package com.schoolapp.core.model.fees.ledger

enum class ConcessionType { PERCENT, FIXED }

enum class RequestStatus { PENDING, APPROVED, REJECTED }

data class Concession(
    val id: String,
    val studentName: String,
    val admissionNo: String?,
    /** Null = all fees. */
    val feeHeadName: String?,
    val type: ConcessionType,
    /** Whole percent for PERCENT, minor units for FIXED. */
    val value: Long,
    /** `YYYY-MM`. */
    val from: String,
    val to: String?,
    val reason: String,
    val estimateMinor: Long?,
    val status: RequestStatus,
)

data class ConcessionInput(
    val studentId: String,
    val feeHeadId: String?,
    val type: ConcessionType,
    val value: Long,
    val from: String,
    val to: String?,
    val reason: String,
)

/** One ledger line; [amountMinor] is positive for charges and negative for payments and credits. */
data class LedgerEntry(
    val id: String,
    val date: String?,
    val type: String?,
    val description: String,
    val amountMinor: Long,
    val balanceMinor: Long,
    val reference: String?,
)

data class StudentLedger(val entries: List<LedgerEntry>, val balanceMinor: Long, val currency: String)
