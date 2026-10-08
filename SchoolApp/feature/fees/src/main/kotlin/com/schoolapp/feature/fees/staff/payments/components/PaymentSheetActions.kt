package com.schoolapp.feature.fees.staff.payments.components

import com.schoolapp.core.model.fees.PaymentMethod
import com.schoolapp.feature.fees.staff.payments.PaymentAction

internal class PaymentSheetActions(
    val onDismiss: () -> Unit,
    val onChoose: (PaymentAction?) -> Unit,
    val onReceipt: () -> Unit,
    val onReasonChange: (String) -> Unit,
    val onAmountChange: (String) -> Unit,
    val onMethodChange: (PaymentMethod) -> Unit,
    val onSubmit: () -> Unit,
    val onConfirm: () -> Unit,
    val onCancelConfirm: () -> Unit,
)
