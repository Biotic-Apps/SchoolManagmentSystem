package com.schoolapp.core.designsystem.component

import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDefaults
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.SelectableDates
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset

/** Date input shared by every screen. Takes and returns the API's `YYYY-MM-DD`; [minDate] / [maxDate] block earlier / later days. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppDatePickerDialog(
    initialDate: String?,
    onConfirm: (String) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    maxDate: String? = null,
    minDate: String? = null,
) {
    val initialMillis = parseDate(initialDate)?.toEpochMillis()
    val maxMillis = parseDate(maxDate)?.toEpochMillis()
    val minMillis = parseDate(minDate)?.toEpochMillis()
    val state = rememberDatePickerState(
        initialSelectedDateMillis = initialMillis,
        selectableDates = object : SelectableDates {
            override fun isSelectableDate(utcTimeMillis: Long): Boolean =
                (maxMillis == null || utcTimeMillis <= maxMillis) && (minMillis == null || utcTimeMillis >= minMillis)

            override fun isSelectableYear(year: Int): Boolean =
                (maxMillis == null || year <= yearOf(maxMillis)) && (minMillis == null || year >= yearOf(minMillis))
        },
    )
    DatePickerDialog(
        onDismissRequest = onDismiss,
        modifier = modifier,
        confirmButton = {
            AppTextButton(
                text = stringResource(R.string.ds_ok),
                enabled = state.selectedDateMillis != null,
                onClick = { state.selectedDateMillis?.let { onConfirm(it.toApiDate()) } },
            )
        },
        dismissButton = {
            AppTextButton(text = stringResource(R.string.ds_cancel), onClick = onDismiss, contentColor = AppColors.TextSecondary)
        },
        colors = DatePickerDefaults.colors(containerColor = AppColors.Surface),
    ) {
        DatePicker(
            state = state,
            colors = DatePickerDefaults.colors(
                containerColor = AppColors.Surface,
                selectedDayContainerColor = AppColors.Primary,
                selectedDayContentColor = AppColors.OnPrimary,
                todayDateBorderColor = AppColors.Primary,
                todayContentColor = AppColors.Primary,
            ),
        )
    }
}

private fun parseDate(value: String?): LocalDate? = value?.take(10)?.let { runCatching { LocalDate.parse(it) }.getOrNull() }

private fun LocalDate.toEpochMillis(): Long = atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli()

private fun yearOf(millis: Long): Int = Instant.ofEpochMilli(millis).atZone(ZoneOffset.UTC).year

private fun Long.toApiDate(): String = Instant.ofEpochMilli(this).atZone(ZoneOffset.UTC).toLocalDate().toString()

@Preview
@Composable
private fun AppDatePickerDialogPreview() = PreviewContainer {
    AppDatePickerDialog(initialDate = "2026-10-05", onConfirm = {}, onDismiss = {})
}
