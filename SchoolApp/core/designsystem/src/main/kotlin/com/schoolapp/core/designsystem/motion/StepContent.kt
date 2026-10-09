package com.schoolapp.core.designsystem.motion

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.SizeTransform
import androidx.compose.animation.togetherWith
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.schoolapp.core.designsystem.theme.AppMotion
import com.schoolapp.core.designsystem.theme.AppTheme

/**
 * Swaps between the steps of one flow (e.g. password -> verification code) along the X axis: a later step
 * ([order] higher) arrives from the right, going back arrives from the left. Height animates between steps.
 */
@Composable
fun <S> StepContent(
    step: S,
    order: (S) -> Int,
    modifier: Modifier = Modifier,
    content: @Composable (S) -> Unit,
) {
    val reduced = AppTheme.reducedMotion
    AnimatedContent(
        targetState = step,
        modifier = modifier,
        contentAlignment = Alignment.TopCenter,
        transitionSpec = {
            val forward = order(targetState) >= order(initialState)
            val enter = if (forward) ScreenTransitions.forwardEnter(reduced) else ScreenTransitions.backEnter(reduced)
            val exit = if (forward) ScreenTransitions.forwardExit(reduced) else ScreenTransitions.backExit(reduced)
            (enter togetherWith exit).using(SizeTransform(clip = false) { _, _ -> AppMotion.standard() })
        },
        label = "step",
    ) { target -> content(target) }
}
