package com.schoolapp.core.designsystem.motion

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.drawOutline
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.AppTheme

/** One shared sweep (0..1) for all skeleton blocks on screen, so they shimmer in sync. Static under reduced motion. */
@Composable
fun rememberShimmerProgress(): State<Float> {
    if (AppTheme.reducedMotion) return remember { mutableFloatStateOf(STATIC) }
    val transition = rememberInfiniteTransition(label = "shimmer")
    return transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(SWEEP_MS, easing = LinearEasing), RepeatMode.Restart),
        label = "shimmerSweep",
    )
}

/** Fills the element with the placeholder tint and a soft highlight travelling left to right. */
fun Modifier.shimmer(progress: State<Float>, shape: Shape): Modifier = drawBehind {
    val outline = shape.createOutline(size, layoutDirection, this)
    drawOutline(outline, AppColors.Selected)
    val sweep = progress.value
    if (sweep == STATIC) return@drawBehind
    val band = size.width.coerceAtLeast(1f)
    val x = -band + sweep * (size.width + band * 2)
    val brush = Brush.linearGradient(
        colors = listOf(AppColors.Background.copy(alpha = 0f), AppColors.Background.copy(alpha = HIGHLIGHT_ALPHA), AppColors.Background.copy(alpha = 0f)),
        start = Offset(x, 0f),
        end = Offset(x + band, 0f),
    )
    drawOutline(outline, brush)
}

private const val SWEEP_MS = 1200
private const val STATIC = -1f
private const val HIGHLIGHT_ALPHA = 0.9f
