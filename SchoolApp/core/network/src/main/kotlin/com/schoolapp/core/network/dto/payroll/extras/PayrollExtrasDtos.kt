package com.schoolapp.core.network.dto.payroll.extras

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class OvertimeDto(
    val id: String = "",
    val staff: IdNameDto? = null,
    val designation: String? = null,
    val date: String = "",
    val minutes: Int = 0,
    val source: String? = null,
    val status: String? = null,
    val reason: String? = null,
    val checkOut: String? = null,
    val decidedBy: IdNameDto? = null,
    val decisionNote: String? = null,
)

/** `GET /payroll/overtime`: the month's entries plus what the screen explains around them. */
@Serializable
data class OvertimeListDto(
    val items: List<OvertimeDto> = emptyList(),
    val pendingCount: Int = 0,
    val approvedMinutes: Int = 0,
    val staffLeavesAt: String? = null,
    val overtimeEnabled: Boolean = false,
    val locked: Boolean = false,
)

@Serializable
data class OvertimeBodyDto(val staffId: String, val date: String, val minutes: Int, val reason: String)

@Serializable
data class OvertimeMonthBodyDto(val branchId: String, val month: String)

@Serializable
data class OvertimeScanDto(val created: Int = 0, val updated: Int = 0, val removed: Int = 0)

@Serializable
data class DecideOvertimeBodyDto(val ids: List<String>, val decision: String, val note: String? = null)

@Serializable
data class AdjustmentDto(
    val id: String = "",
    val staffId: String = "",
    val staff: IdNameDto? = null,
    val month: String = "",
    val kind: String = "",
    val amountMinor: Long = 0,
    val signedMinor: Long? = null,
    val reason: String? = null,
    val status: String? = null,
    val cancelReason: String? = null,
)

@Serializable
data class AdjustmentBodyDto(val staffId: String, val month: String, val kind: String, val amountMinor: Long, val reason: String)

@Serializable
data class CancelBodyDto(val reason: String)
