package com.schoolapp.core.designsystem.component

import androidx.compose.runtime.staticCompositionLocalOf

/**
 * True inside containers that already apply the page gutter (ScreenColumn, cards, sheets), so full-width
 * states such as [LoadingState] do not add a second gutter when used inline.
 */
internal val LocalInsetContent = staticCompositionLocalOf { false }
