package com.schoolapp.core.designsystem.motion

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.VisibilityThreshold
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.lazy.LazyItemScope
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.IntOffset
import com.schoolapp.core.designsystem.theme.AppMotion

/**
 * Wraps every item a screen adds so that, without touching the screen: items stagger in on the list's first
 * load ([EntranceGate]), and later inserts/removals/moves fade and glide instead of jumping.
 */
internal class AnimatedListScope(
    private val delegate: LazyListScope,
    private val gate: EntranceGate,
) : LazyListScope {
    private var position = 0

    override fun item(key: Any?, contentType: Any?, content: @Composable LazyItemScope.() -> Unit) {
        val order = position++
        val itemGate = gate
        delegate.item(key, contentType) { AnimatedItem(order, itemGate) { content() } }
    }

    override fun items(
        count: Int,
        key: ((index: Int) -> Any)?,
        contentType: (index: Int) -> Any?,
        itemContent: @Composable LazyItemScope.(index: Int) -> Unit,
    ) {
        val start = position
        position += count
        val itemGate = gate
        delegate.items(count, key, contentType) { index -> AnimatedItem(start + index, itemGate) { itemContent(index) } }
    }
}

@Composable
private fun LazyItemScope.AnimatedItem(order: Int, gate: EntranceGate, content: @Composable LazyItemScope.() -> Unit) {
    val scope = this
    Box(
        Modifier
            .animateItem(
                fadeInSpec = tween(AppMotion.QUICK, easing = AppMotion.Standard),
                placementSpec = spring(stiffness = Spring.StiffnessMediumLow, visibilityThreshold = IntOffset.VisibilityThreshold),
                fadeOutSpec = tween(AppMotion.FADE_OUT, easing = AppMotion.Accelerate),
            )
            .gatedEntrance(gate, order),
    ) { scope.content() }
}
