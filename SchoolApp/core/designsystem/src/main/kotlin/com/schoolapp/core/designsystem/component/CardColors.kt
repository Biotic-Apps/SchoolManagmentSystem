package com.schoolapp.core.designsystem.component

import androidx.compose.animation.animateColorAsState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.AppMotion

@Immutable
internal data class CardColors(val container: Color, val border: Color)

/** Card fill and border for its state; changes cross-fade quickly rather than snapping. */
@Composable
internal fun cardColors(selected: Boolean, pressed: Boolean, tone: StatusTone?): CardColors {
    val toneColors = tone?.colors()
    val container = when {
        selected -> AppColors.Selected
        toneColors != null -> toneColors.container
        else -> AppColors.CardBackground
    }
    val border = when {
        selected -> AppColors.Primary
        pressed -> AppColors.Primary.copy(alpha = PRESSED_BORDER_ALPHA)
        toneColors != null -> toneColors.content.copy(alpha = TONE_BORDER_ALPHA)
        else -> AppColors.Border
    }
    return CardColors(
        container = animateColorAsState(container, AppMotion.quick(), label = "cardContainer").value,
        border = animateColorAsState(border, AppMotion.quick(), label = "cardBorder").value,
    )
}

private const val PRESSED_BORDER_ALPHA = 0.5f
private const val TONE_BORDER_ALPHA = 0.35f
