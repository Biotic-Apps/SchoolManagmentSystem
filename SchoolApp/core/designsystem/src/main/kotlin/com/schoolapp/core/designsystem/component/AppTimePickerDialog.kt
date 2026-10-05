package com.schoolapp.core.designsystem.component

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.material3.TimePicker
import androidx.compose.material3.TimePickerDefaults
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors
import java.util.Locale

/**
 * Time input for every screen: always the 12-hour clock with AM/PM, whatever the device setting.
 * Takes and returns the API's 24-hour `HH:mm` so callers never convert.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppTimePickerDialog(
    initialTime: String?,
    onConfirm: (String) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    title: String? = null,
) {
    val (hour, minute) = parseHourMinute(initialTime)
    val state = rememberTimePickerState(initialHour = hour, initialMinute = minute, is24Hour = false)
    AlertDialog(
        onDismissRequest = onDismiss,
        modifier = modifier,
        containerColor = AppColors.Surface,
        title = title?.let { { Text(it) } },
        text = {
            TimePicker(
                state = state,
                colors = TimePickerDefaults.colors(
                    clockDialColor = AppColors.Selected,
                    selectorColor = AppColors.Primary,
                    timeSelectorSelectedContainerColor = AppColors.Selected,
                    timeSelectorSelectedContentColor = AppColors.Primary,
                    periodSelectorSelectedContainerColor = AppColors.Selected,
                    periodSelectorSelectedContentColor = AppColors.Primary,
                    periodSelectorBorderColor = AppColors.Border,
                ),
            )
        },
        confirmButton = {
            AppTextButton(
                text = stringResource(R.string.ds_ok),
                onClick = { onConfirm("%02d:%02d".format(Locale.ENGLISH, state.hour, state.minute)) },
            )
        },
        dismissButton = {
            AppTextButton(text = stringResource(R.string.ds_cancel), onClick = onDismiss, contentColor = AppColors.TextSecondary)
        },
    )
}

private fun parseHourMinute(value: String?): Pair<Int, Int> {
    val parts = value?.trim()?.split(':')
    val hour = parts?.getOrNull(0)?.toIntOrNull()?.takeIf { it in 0..23 } ?: DEFAULT_HOUR
    val minute = parts?.getOrNull(1)?.toIntOrNull()?.takeIf { it in 0..59 } ?: 0
    return hour to minute
}

private const val DEFAULT_HOUR = 8

@Preview
@Composable
private fun AppTimePickerDialogPreview() = PreviewContainer {
    AppTimePickerDialog(initialTime = "14:30", onConfirm = {}, onDismiss = {}, title = "Attendance locks at")
}
