package com.schoolapp.feature.expenses.common

import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.expenses.ExpensePaymentMethod
import com.schoolapp.core.model.expenses.ExpenseStatus
import com.schoolapp.feature.expenses.R
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.util.Locale

/** Statuses offered in the list filter (UNKNOWN is never shown). */
internal val FilterStatuses: List<ExpenseStatus> = ExpenseStatus.entries.filter { it != ExpenseStatus.UNKNOWN }

@StringRes
internal fun ExpenseStatus.labelRes(): Int = when (this) {
    ExpenseStatus.DRAFT -> R.string.expenses_status_draft
    ExpenseStatus.SUBMITTED -> R.string.expenses_status_submitted
    ExpenseStatus.APPROVED -> R.string.expenses_status_approved
    ExpenseStatus.REJECTED -> R.string.expenses_status_rejected
    ExpenseStatus.PARTIALLY_PAID -> R.string.expenses_status_partially_paid
    ExpenseStatus.PAID -> R.string.expenses_status_paid
    ExpenseStatus.UNKNOWN -> R.string.expenses_status_unknown
}

internal fun ExpenseStatus.tone(): StatusTone = when (this) {
    ExpenseStatus.DRAFT -> StatusTone.Neutral
    ExpenseStatus.SUBMITTED -> StatusTone.Warning
    ExpenseStatus.APPROVED -> StatusTone.Info
    ExpenseStatus.REJECTED -> StatusTone.Error
    ExpenseStatus.PARTIALLY_PAID -> StatusTone.Warning
    ExpenseStatus.PAID -> StatusTone.Success
    ExpenseStatus.UNKNOWN -> StatusTone.Neutral
}

@StringRes
internal fun ExpensePaymentMethod.labelRes(): Int = when (this) {
    ExpensePaymentMethod.CASH -> R.string.expenses_method_cash
    ExpensePaymentMethod.BANK -> R.string.expenses_method_bank
    ExpensePaymentMethod.CHEQUE -> R.string.expenses_method_cheque
}

@Composable
@ReadOnlyComposable
internal fun statusLabel(status: ExpenseStatus): String = stringResource(status.labelRes())

/** `YYYY-MM` as "Mar 2027"; falls back to the raw text. */
internal fun formatMonth(raw: String?): String? {
    if (raw.isNullOrBlank()) return null
    return try {
        YearMonth.parse(raw.take(MONTH_LENGTH)).format(MonthFormatter)
    } catch (e: DateTimeParseException) {
        raw
    }
}

private const val MONTH_LENGTH = 7
private val MonthFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH)
