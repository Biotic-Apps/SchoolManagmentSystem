package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors

/** Amount input in major units ("12500" or "12500.50") with the currency symbol in front; parse with [MoneyFormat.parse]. */
@Composable
fun MoneyField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    currency: String = MoneyFormat.DEFAULT_CURRENCY,
    errorText: String? = null,
    supportingText: String? = null,
    enabled: Boolean = true,
) {
    AppTextField(
        value = value,
        onValueChange = { typed -> onValueChange(typed.filter { it.isDigit() || it == '.' || it == ',' }) },
        label = label,
        modifier = modifier,
        errorText = errorText,
        supportingText = supportingText,
        enabled = enabled,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal, imeAction = ImeAction.Next),
        leadingIcon = { Text(MoneyFormat.symbol(currency), color = AppColors.TextSecondary) },
    )
}

@Preview
@Composable
private fun MoneyFieldPreview() = PreviewContainer { MoneyField("12500", {}, "Amount") }
