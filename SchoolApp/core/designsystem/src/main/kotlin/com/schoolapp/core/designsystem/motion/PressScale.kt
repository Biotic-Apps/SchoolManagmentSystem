package com.schoolapp.core.designsystem.motion

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.interaction.InteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import com.schoolapp.core.designsystem.theme.AppMotion
import com.schoolapp.core.designsystem.theme.AppTheme

/**
 * Settles the element to [AppMotion.PRESS_SCALE] while [interactionSource] is pressed (spring, no bounce),
 * so taps register even before the ripple spreads. Draw-phase only: no relayout. Off under reduced motion.
 */
@Composable
fun Modifier.pressScale(interactionSource: InteractionSource, enabled: Boolean = true): Modifier {
    val pressed by interactionSource.collectIsPressedAsState()
    val active = enabled && !AppTheme.reducedMotion
    val scale by animateFloatAsState(
        targetValue = if (active && pressed) AppMotion.PRESS_SCALE else 1f,
        animationSpec = AppMotion.pressSpring(),
        label = "pressScale",
    )
    return if (!active) this else graphicsLayer {
        scaleX = scale
        scaleY = scale
    }
}
