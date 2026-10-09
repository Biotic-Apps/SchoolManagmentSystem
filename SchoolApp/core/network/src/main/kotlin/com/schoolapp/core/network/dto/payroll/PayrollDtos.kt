package com.schoolapp.core.network.dto.payroll

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class PayItemDto(val name: String = "", val amountMinor: Long = 0)

@Serializable
data class PayslipDto(
    val month: String = "",
    val staff: PayslipStaffDto? = null,
    val name: String? = null,
    val designation: String? = null,
    val basicMinor: Long = 0,
    val allowances: List<PayItemDto> = emptyList(),
    val deductions: List<PayItemDto> = emptyList(),
    val allowancesMinor: Long? = null,
    val deductionsMinor: Long? = null,
    val unpaidLeaveDays: Double = 0.0,
    val leaveDeductionMinor: Long = 0,
    val adjustmentsMinor: Long = 0,
    val overtimeMinutes: Int = 0,
    val overtimeMinor: Long = 0,
    val grossMinor: Long? = null,
    val netMinor: Long = 0,
    val paidMinor: Long = 0,
    val balanceMinor: Long = 0,
    val status: String? = null,
    val pdf: PayslipPdfDto? = null,
    val pdfUrl: String? = null,
    val fileUrl: String? = null,
    val currency: String? = null,
    val breakdown: PayBreakdownDto? = null,
)

@Serializable
data class PayrollLineDto(
    val staffId: String = "",
    val name: String = "",
    val designation: String? = null,
    val basicMinor: Long = 0,
    val allowancesMinor: Long = 0,
    val deductionsMinor: Long = 0,
    val unpaidLeaveDays: Double = 0.0,
    val leaveDeductionMinor: Long = 0,
    val adjustmentsMinor: Long = 0,
    val overtimeMinutes: Int = 0,
    val overtimeMinor: Long = 0,
    val grossMinor: Long? = null,
    val netMinor: Long = 0,
    val paidMinor: Long = 0,
    val balanceMinor: Long = 0,
    val status: String? = null,
    val breakdown: PayBreakdownDto? = null,
)

@Serializable
data class PayrollRunDto(
    val id: String,
    val branch: IdNameDto? = null,
    val month: String = "",
    val status: String? = null,
    val staffCount: Int? = null,
    val netMinor: Long? = null,
    val paidMinor: Long? = null,
    val balanceMinor: Long? = null,
    val approvalId: String? = null,
    val approval: RunApprovalDto? = null,
    val totals: PayrollTotalsDto? = null,
    val lines: List<PayrollLineDto>? = null,
)

@Serializable
data class RunApprovalDto(val id: String? = null, val status: String? = null)

@Serializable
data class PayrollTotalsDto(val netMinor: Long? = null, val paidMinor: Long? = null, val balanceMinor: Long? = null)
