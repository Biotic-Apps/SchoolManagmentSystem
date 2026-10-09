package com.schoolapp.core.designsystem.motion

import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import com.schoolapp.core.designsystem.theme.AppMotion

/**
 * Screen transitions, used by every NavHost.
 * - Forward/back (opening a detail, going back): shared X axis — a short slide (forward moves left) with a
 *   fade-through, so the user sees where the new screen came from and returns the same way.
 * - Peer switch (bottom bar / drawer item, sign-in -> home): fade-through with a subtle scale, no direction.
 * Under reduced motion everything becomes a plain cross-fade.
 */
object ScreenTransitions {
    private const val SLIDE_FRACTION = 0.08f
    private val fadeInDelayed = fadeIn(tween(AppMotion.STANDARD - AppMotion.FADE_OUT, delayMillis = AppMotion.FADE_OUT, easing = AppMotion.Decelerate))
    private val fadeOutFast = fadeOut(tween(AppMotion.FADE_OUT, easing = AppMotion.Accelerate))

    private fun slideIn(sign: Int) =
        slideInHorizontally(tween(AppMotion.STANDARD, easing = AppMotion.Standard)) { (it * SLIDE_FRACTION).toInt() * sign }

    private fun slideOut(sign: Int) =
        slideOutHorizontally(tween(AppMotion.STANDARD, easing = AppMotion.Standard)) { (it * SLIDE_FRACTION).toInt() * sign }

    fun forwardEnter(reduced: Boolean): EnterTransition = if (reduced) fadeInDelayed else slideIn(1) + fadeInDelayed
    fun forwardExit(reduced: Boolean): ExitTransition = if (reduced) fadeOutFast else slideOut(-1) + fadeOutFast
    fun backEnter(reduced: Boolean): EnterTransition = if (reduced) fadeInDelayed else slideIn(-1) + fadeInDelayed
    fun backExit(reduced: Boolean): ExitTransition = if (reduced) fadeOutFast else slideOut(1) + fadeOutFast

    fun peerEnter(reduced: Boolean): EnterTransition =
        if (reduced) fadeInDelayed else fadeInDelayed + scaleIn(tween(AppMotion.STANDARD, easing = AppMotion.Decelerate), initialScale = PEER_SCALE)

    fun peerExit(): ExitTransition = fadeOutFast

    private const val PEER_SCALE = 0.98f
}
