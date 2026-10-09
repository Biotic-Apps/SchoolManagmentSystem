package com.schoolapp.core.designsystem.motion

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.Measurable
import androidx.compose.ui.layout.MeasureResult
import androidx.compose.ui.layout.MeasureScope
import androidx.compose.ui.node.LayoutModifierNode
import androidx.compose.ui.node.ModifierNodeElement
import androidx.compose.ui.platform.InspectorInfo
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Dp
import com.schoolapp.core.designsystem.theme.AppMotion
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Fades the element in while it rises by [offset], once, when it first attaches. [order] staggers siblings
 * ([AppMotion.STAGGER_STEP] each, capped at [AppMotion.STAGGER_CAP]). Transform and alpha only — no relayout.
 * Pass `offset = 0.dp` for a pure fade (reduced motion).
 */
fun Modifier.entrance(order: Int = 0, offset: Dp = AppMotion.EnterOffset, enabled: Boolean = true): Modifier =
    if (enabled) this then EntranceElement(order.coerceIn(0, AppMotion.STAGGER_CAP), offset) else this

private data class EntranceElement(val order: Int, val offset: Dp) : ModifierNodeElement<EntranceNode>() {
    override fun create() = EntranceNode(order, offset)
    override fun update(node: EntranceNode) {
        node.order = order
        node.offset = offset
    }
    override fun InspectorInfo.inspectableProperties() {
        name = "entrance"
        properties["order"] = order
        properties["offset"] = offset
    }
}

private class EntranceNode(var order: Int, var offset: Dp) : Modifier.Node(), LayoutModifierNode {
    private val progress = Animatable(0f)

    override fun onAttach() {
        coroutineScope.launch {
            delay((order * AppMotion.STAGGER_STEP).toLong())
            progress.animateTo(1f, tween(AppMotion.STANDARD, easing = AppMotion.Decelerate))
        }
    }

    override fun MeasureScope.measure(measurable: Measurable, constraints: Constraints): MeasureResult {
        val placeable = measurable.measure(constraints)
        val travel = offset.toPx()
        return layout(placeable.width, placeable.height) {
            placeable.placeWithLayer(0, 0) {
                val value = progress.value
                alpha = value
                translationY = (1f - value) * travel
            }
        }
    }
}
