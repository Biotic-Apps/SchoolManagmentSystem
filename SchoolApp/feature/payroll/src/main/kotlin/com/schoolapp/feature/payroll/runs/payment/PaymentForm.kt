package com.schoolapp.feature.payroll.runs.payment

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.payroll.SalaryPaymentMethod

/** "Record payment" sheet for one staff line; the amount starts at the outstanding balance. */
@Immutable
data class PaymentForm(
    val staffId: String,
    val amount: String,
    val paidOn: String,
    val method: SalaryPaymentMethod? = null,
    val reference: String = "",
    /** Inline errors show after the first submit attempt. */
    val showErrors: Boolean = false,
    val saving: Boolean = false,
    val error: AppError? = null,
)
