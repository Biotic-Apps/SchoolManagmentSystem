package com.schoolapp.core.network.dto.payroll

import kotlinx.serialization.Serializable

@Serializable
data class CreatePayrollRunRequest(val branchId: String, val month: String)

/** `{jobId}` from POST /payroll/runs/:id/calculate. */
@Serializable
data class PayrollJobDto(val jobId: String? = null)

/** One salary payment; [amountMinor] must not exceed the line balance. */
@Serializable
data class PayrollPaymentRequest(
    val staffId: String,
    val amountMinor: Long,
    val method: String,
    val reference: String? = null,
    val paidOn: String,
)
