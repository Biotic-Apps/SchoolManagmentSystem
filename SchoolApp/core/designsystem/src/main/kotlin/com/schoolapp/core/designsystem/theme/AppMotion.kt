package com.schoolapp.core.designsystem.theme

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.Easing
import androidx.compose.animation.core.FiniteAnimationSpec
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.ui.unit.dp

/**
 * Motion tokens. Character: calm and precise (a school office, not a game) — short ease-out moves, no bounce.
 * Every animation in the app uses one of these four durations; exits use roughly 0.7x of the matching entry.
 */
object AppMotion {
    /** Toggles, checkboxes, colour flips. */
    const val INSTANT = 100

    /** Press feedback, small fades, chips. */
    const val QUICK = 180

    /** Most transitions: screens, sheets, expanding cards, list entry. */
    const val STANDARD = 280

    /** Rare hero moments. */
    const val SLOW = 450

    /** Delay between staggered list items, and the item count after which the stagger stops growing. */
    const val STAGGER_STEP = 30
    const val STAGGER_CAP = 8

    /** Outgoing screen fades out within this window before the incoming one fades in (fade-through). */
    const val FADE_OUT = 90

    val Standard: Easing = CubicBezierEasing(0.2f, 0f, 0f, 1f)
    val Decelerate: Easing = CubicBezierEasing(0f, 0f, 0f, 1f)
    val Accelerate: Easing = CubicBezierEasing(0.3f, 0f, 1f, 1f)

    /** Scale a pressed card or button settles to. */
    const val PRESS_SCALE = 0.97f

    /** Vertical travel for list items and screens arriving. */
    val EnterOffset = 12.dp

    fun <T> quick(): FiniteAnimationSpec<T> = tween(QUICK, easing = Standard)
    fun <T> standard(): FiniteAnimationSpec<T> = tween(STANDARD, easing = Standard)

    /** Springs for direct manipulation (press), no overshoot. */
    fun <T> pressSpring(): FiniteAnimationSpec<T> =
        spring(dampingRatio = Spring.DampingRatioNoBouncy, stiffness = Spring.StiffnessMediumLow)
}
