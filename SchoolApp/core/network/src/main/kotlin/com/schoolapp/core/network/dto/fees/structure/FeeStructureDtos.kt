package com.schoolapp.core.network.dto.fees.structure

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class FeeHeadDto(
    val id: String = "",
    val schoolId: String? = null,
    val code: String = "",
    val name: String = "",
    val kind: String = "RECURRING",
    val refundable: Boolean = false,
    val system: Boolean = false,
    val status: String? = null,
)

@Serializable
data class FeeHeadBodyDto(val schoolId: String, val code: String, val name: String, val kind: String, val refundable: Boolean)

@Serializable
data class FeePlanItemDto(
    val id: String? = null,
    val feeHead: IdNameDto? = null,
    val feeHeadId: String? = null,
    val amountMinor: Long = 0,
    val frequency: String = "MONTHLY",
    val dueDay: Int = 10,
)

@Serializable
data class LateFeeDto(val amountMinor: Long = 0, val afterDays: Int = 0)

@Serializable
data class FeePlanDto(
    val id: String = "",
    val branchId: String? = null,
    val sessionId: String? = null,
    val classId: String = "",
    val className: String? = null,
    val name: String = "",
    val status: String? = null,
    val items: List<FeePlanItemDto> = emptyList(),
    val lateFee: LateFeeDto? = null,
    val approvalId: String? = null,
)

@Serializable
data class FeePlanItemBodyDto(val feeHeadId: String, val amountMinor: Long, val frequency: String, val dueDay: Int)

@Serializable
data class SiblingDiscountDto(val id: String = "", val schoolId: String? = null, val childIndex: Int = 2, val percentOff: Int = 0)

@Serializable
data class SiblingDiscountBodyDto(val schoolId: String, val childIndex: Int, val percentOff: Int)

@Serializable
data class SiblingPercentBodyDto(val percentOff: Int)

@Serializable
data class ArchiveBodyDto(val reason: String? = null)
