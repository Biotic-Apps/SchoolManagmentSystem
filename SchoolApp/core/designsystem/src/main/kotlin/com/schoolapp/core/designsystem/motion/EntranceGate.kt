package com.schoolapp.core.designsystem.motion

import android.os.SystemClock
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppMotion
import com.schoolapp.core.designsystem.theme.AppTheme
import kotlinx.coroutines.delay

/**
 * Decides whether list items stagger in: only for items composed during the list's first moments on screen
 * (its first load), never for items scrolled into view later, and not again when returning to the screen.
 */
@Stable
class EntranceGate internal constructor(private val active: Boolean, val offset: Dp) {
    private val startedAt = SystemClock.uptimeMillis()

    /** Call once per item (inside `remember`): true while the list is still making its first appearance. */
    fun admits(): Boolean = active && SystemClock.uptimeMillis() - startedAt < WINDOW_MS

    internal companion object {
        const val WINDOW_MS = 400L
    }
}

/** Staggered first-load entrance for an item of a custom lazy layout (grids); ScreenColumn items get it for free. */
@Composable
fun Modifier.gatedEntrance(gate: EntranceGate, order: Int): Modifier {
    val admitted = remember(gate) { gate.admits() }
    return entrance(order = order, offset = gate.offset, enabled = admitted)
}

@Composable
fun rememberEntranceGate(): EntranceGate {
    var shown by rememberSaveable { mutableStateOf(false) }
    val reduced = AppTheme.reducedMotion
    val gate = remember { EntranceGate(active = !shown, offset = if (reduced) 0.dp else AppMotion.EnterOffset) }
    LaunchedEffect(Unit) {
        delay(EntranceGate.WINDOW_MS)
        shown = true
    }
    return gate
}
