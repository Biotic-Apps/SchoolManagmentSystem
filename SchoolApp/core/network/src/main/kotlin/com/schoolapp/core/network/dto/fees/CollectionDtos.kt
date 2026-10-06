package com.schoolapp.core.network.dto.fees

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AgingDto(
    @SerialName("0-30") val d0to30: Long = 0,
    @SerialName("31-60") val d31to60: Long = 0,
    @SerialName("61-90") val d61to90: Long = 0,
    @SerialName("90+") val d90plus: Long = 0,
)

@Serializable
data class DuesRowDto(
    val studentId: String? = null,
    val student: IdNameDto? = null,
    val name: String? = null,
    val admissionNo: String? = null,
    val className: String? = null,
    val sectionName: String? = null,
    val balanceMinor: Long = 0,
    val oldestDueDays: Int? = null,
    val days: Int? = null,
    val aging: AgingDto? = null,
)

@Serializable
data class MethodTotalDto(val method: String? = null, val amountMinor: Long = 0, val count: Int = 0)

@Serializable
data class CashierTotalDto(val cashier: IdNameDto? = null, val name: String? = null, val amountMinor: Long = 0, val count: Int = 0)

@Serializable
data class DailyCollectionDto(
    val date: String? = null,
    val totalMinor: Long = 0,
    val byMethod: List<MethodTotalDto> = emptyList(),
    val byCashier: List<CashierTotalDto> = emptyList(),
    val payments: List<PaymentDto> = emptyList(),
    val closed: Boolean = false,
)

@Serializable
data class FinanceDashboardDto(
    val billedMinor: Long = 0,
    val collectedMinor: Long = 0,
    val outstandingMinor: Long = 0,
    val overdueMinor: Long = 0,
    val collectionRate: Double = 0.0,
    val expensesMinor: Long = 0,
    val payrollMinor: Long = 0,
    val todayCollectedMinor: Long = 0,
)
