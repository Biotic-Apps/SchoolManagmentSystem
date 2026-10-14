package com.schoolapp.feature.payroll.runs.payment

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.payroll.SalaryPaymentMethod
import com.schoolapp.feature.payroll.R

/** Cash / Bank transfer / Cheque; nothing is preselected so the method is always a deliberate choice. */
@Composable
internal fun MethodChoice(selected: SalaryPaymentMethod?, onSelect: (SalaryPaymentMethod) -> Unit, showError: Boolean) {
    val methods = SalaryPaymentMethod.entries
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(stringResource(R.string.payroll_payment_method), style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
        SegmentedChoice(
            labels = methods.map { stringResource(it.label()) },
            selectedIndex = selected?.let(methods::indexOf) ?: -1,
            onSelect = { onSelect(methods[it]) },
        )
        if (showError) {
            Text(stringResource(R.string.payroll_error_method_required), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        }
    }
}

private fun SalaryPaymentMethod.label(): Int = when (this) {
    SalaryPaymentMethod.CASH -> R.string.payroll_method_cash
    SalaryPaymentMethod.BANK -> R.string.payroll_method_bank
    SalaryPaymentMethod.CHEQUE -> R.string.payroll_method_cheque
}
