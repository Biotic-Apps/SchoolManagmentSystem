package com.schoolapp.core.designsystem.component

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import com.schoolapp.core.designsystem.theme.AppMotion
import com.schoolapp.core.designsystem.theme.AppTheme

/** A number/value that rolls up when it changes (e.g. after refresh); no animation on first show. */
@Composable
fun AnimatedValueText(value: String, style: TextStyle, color: Color, modifier: Modifier = Modifier) {
    val reduced = AppTheme.reducedMotion
    AnimatedContent(
        targetState = value,
        modifier = modifier,
        transitionSpec = {
            val enter = fadeIn(tween(AppMotion.QUICK, easing = AppMotion.Decelerate))
            val exit = fadeOut(tween(AppMotion.FADE_OUT, easing = AppMotion.Accelerate))
            if (reduced) {
                enter togetherWith exit
            } else {
                (enter + slideInVertically(tween(AppMotion.QUICK, easing = AppMotion.Decelerate)) { it / 2 }) togetherWith
                    (exit + slideOutVertically(tween(AppMotion.FADE_OUT, easing = AppMotion.Accelerate)) { -it / 2 })
            }
        },
        label = "valueText",
    ) { target -> Text(target, style = style, color = color) }
}
