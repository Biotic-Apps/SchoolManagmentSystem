package com.schoolapp.feature.homework.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.feature.homework.R
import java.time.LocalDate
import java.time.format.DateTimeParseException
import java.time.temporal.ChronoUnit

internal data class DueLabel(val text: String, val overdue: Boolean)

/** "Due in 3 days" / "Overdue by 2 day(s)" relative to today, like the web card. */
@Composable
internal fun dueLabel(dueDate: String, today: LocalDate = LocalDate.now()): DueLabel? {
    val due = try {
        LocalDate.parse(dueDate.take(DATE_LENGTH))
    } catch (e: DateTimeParseException) {
        return null
    }
    val diff = ChronoUnit.DAYS.between(today, due).toInt()
    return when {
        diff < 0 -> DueLabel(stringResource(R.string.homework_overdue_by, -diff), overdue = true)
        diff == 0 -> DueLabel(stringResource(R.string.homework_due_today), overdue = false)
        diff == 1 -> DueLabel(stringResource(R.string.homework_due_tomorrow), overdue = false)
        else -> DueLabel(stringResource(R.string.homework_due_in, diff), overdue = false)
    }
}

private const val DATE_LENGTH = 10
