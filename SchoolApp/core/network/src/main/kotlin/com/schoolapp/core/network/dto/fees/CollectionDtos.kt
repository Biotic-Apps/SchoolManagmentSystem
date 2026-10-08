package com.schoolapp.core.network.dto.fees

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AgingDto(
    @SerialName("d0_30") val d0to30: Long = 0,
    @SerialName("d31_60") val d31to60: Long = 0,
    @SerialName("d61_90") val d61to90: Long = 0,
    @SerialName("d90plus") val d90plus: Long = 0,
)

/** `dues` rows nest the student with class and section. */
@Serializable
data class DuesStudentDto(
    val id: String? = null,
    val name: String? = null,
    val admissionNo: String? = null,
    val className: String? = null,
    val sectionName: String? = null,
)

@Serializable
data class DuesGuardianDto(val name: String? = null, val phone: String? = null, val relation: String? = null)

@Serializable
data class DuesRowDto(
    val studentId: String? = null,
    val student: DuesStudentDto? = null,
    val name: String? = null,
    val admissionNo: String? = null,
    val className: String? = null,
    val sectionName: String? = null,
    val balanceMinor: Long = 0,
    val overdueMinor: Long = 0,
    val oldestOverdueDays: Int? = null,
    val oldestDueDays: Int? = null,
    val days: Int? = null,
    val openInvoices: Int = 0,
    val aging: AgingDto? = null,
    val guardian: DuesGuardianDto? = null,
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
    val count: Int = 0,
    val cashMinor: Long = 0,
    val reversedCount: Int = 0,
    val reversedMinor: Long = 0,
    /** Null while the day is open; the stored cash count once closed. */
    val closed: DayClosingDto? = null,
)

@Serializable
data class DayClosingDto(
    val closedBy: IdNameDto? = null,
    val closedAt: String? = null,
    val cashExpectedMinor: Long = 0,
    val cashCountedMinor: Long = 0,
    val differenceMinor: Long = 0,
    val note: String? = null,
)

@Serializable
data class CloseDayBodyDto(val branchId: String, val date: String, val cashCountedMinor: Long, val note: String? = null)

@Serializable
data class DueRemindersBodyDto(val studentIds: List<String>)

@Serializable
data class JobRefDto(val jobId: String? = null)

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
