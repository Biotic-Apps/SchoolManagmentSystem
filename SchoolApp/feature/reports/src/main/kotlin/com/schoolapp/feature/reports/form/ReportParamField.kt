package com.schoolapp.feature.reports.form

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ArrowDropDown
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.model.reports.ReportParam
import com.schoolapp.core.model.reports.ReportParamType
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.reports.R
import com.schoolapp.feature.reports.components.paramLabel

/** One filter: pickers for ids / months / dates, a number or text box otherwise. */
@Composable
internal fun ReportParamField(
    param: ReportParam,
    value: String,
    error: FieldError?,
    options: ParamOptions,
    onPick: () -> Unit,
    onRetryOptions: () -> Unit,
    onValueChange: (String) -> Unit,
    enabled: Boolean,
    modifier: Modifier = Modifier,
) {
    val base = paramLabel(param)
    val label = if (param.required) base else stringResource(R.string.reports_optional, base)
    val errorText = error?.let { fieldErrorText(it, base) }
    when (param.type) {
        ReportParamType.BRANCH, ReportParamType.SCHOOL, ReportParamType.EXAM -> {
            val optionsError = options.error
            PickerField(
                value = when {
                    options.isLoading -> stringResource(R.string.reports_options_loading)
                    value.isEmpty() -> if (param.required) "" else stringResource(R.string.reports_all)
                    else -> options.options.firstOrNull { it.id == value }?.label.orEmpty()
                },
                label = label,
                onClick = if (optionsError != null) onRetryOptions else onPick,
                errorText = optionsError?.let { appErrorMessage(it) } ?: errorText,
                enabled = enabled && !options.isLoading,
                icon = if (optionsError != null) Icons.Outlined.Refresh else Icons.Outlined.ArrowDropDown,
                modifier = modifier,
            )
        }
        ReportParamType.MONTH -> PickerField(
            value = if (value.isEmpty()) "" else monthLabel(value),
            label = label,
            onClick = onPick,
            errorText = errorText,
            enabled = enabled,
            modifier = modifier,
        )
        ReportParamType.DATE -> PickerField(
            value = formatDate(value).orEmpty(),
            label = label,
            onClick = onPick,
            errorText = errorText,
            enabled = enabled,
            icon = Icons.Outlined.CalendarMonth,
            modifier = modifier,
        )
        ReportParamType.NUMBER -> AppTextField(
            value = value,
            onValueChange = { text -> onValueChange(text.filter(Char::isDigit).take(MAX_DIGITS)) },
            label = label,
            errorText = errorText,
            enabled = enabled,
            kind = FieldKind.Number,
            modifier = modifier,
        )
        ReportParamType.TEXT -> AppTextField(
            value = value,
            onValueChange = onValueChange,
            label = label,
            errorText = errorText,
            enabled = enabled,
            modifier = modifier,
        )
    }
}

@Composable
private fun fieldErrorText(error: FieldError, label: String): String = when (error) {
    FieldError.REQUIRED -> stringResource(R.string.reports_error_required, label.lowercase())
    FieldError.BAD_DATE -> stringResource(R.string.reports_error_date)
    FieldError.BAD_MONTH -> stringResource(R.string.reports_error_month)
    FieldError.BAD_NUMBER -> stringResource(R.string.reports_error_number)
    FieldError.END_BEFORE_START -> stringResource(R.string.reports_error_range)
}

private const val MAX_DIGITS = 4
