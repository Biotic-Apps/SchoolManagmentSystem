package com.schoolapp.core.designsystem.theme

import android.content.Context
import android.provider.Settings
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.platform.LocalContext

/**
 * True when the user turned animations off (Developer options or Accessibility "Remove animations",
 * i.e. animator duration scale 0). Movement (slides, scale, stagger) is then dropped; fades stay.
 */
val LocalReducedMotion = staticCompositionLocalOf { false }

@Composable
internal fun rememberReducedMotion(): Boolean {
    val context = LocalContext.current
    return remember(context) { context.animatorScale() == 0f }
}

private fun Context.animatorScale(): Float =
    runCatching { Settings.Global.getFloat(contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) }.getOrDefault(1f)
