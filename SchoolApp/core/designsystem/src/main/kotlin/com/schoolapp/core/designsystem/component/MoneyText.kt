package com.schoolapp.core.designsystem.component

import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors

/** Tabular figures so amounts line up in columns. */
const val TabularNumbers = "tnum"

/** An amount in minor units, e.g. "Rs 12,500"; right-aligned with tabular digits for lists. */
@Composable
fun MoneyText(
    amountMinor: Long,
    modifier: Modifier = Modifier,
    currency: String = MoneyFormat.DEFAULT_CURRENCY,
    style: TextStyle = LocalTextStyle.current,
    color: Color = AppColors.TextPrimary,
    fontWeight: FontWeight? = null,
    textAlign: TextAlign = TextAlign.End,
) {
    Text(
        text = MoneyFormat.format(amountMinor, currency),
        modifier = modifier,
        style = style.copy(fontFeatureSettings = TabularNumbers),
        color = color,
        fontWeight = fontWeight,
        textAlign = textAlign,
        maxLines = 1,
        softWrap = false,
    )
}

@Preview
@Composable
private fun MoneyTextPreview() = PreviewContainer { MoneyText(1_250_000) }
