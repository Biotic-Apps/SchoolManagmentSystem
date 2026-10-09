package com.schoolapp.core.designsystem.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

/** Three radii only: [Small] for icon tiles and segments, [Input] for fields and buttons, [Card] for cards, dialogs and sheets. */
object AppRadius {
    val Small = 8.dp
    val Input = 12.dp
    val Card = 16.dp
}

internal val AppShapes = Shapes(
    extraSmall = RoundedCornerShape(AppRadius.Small),
    small = RoundedCornerShape(AppRadius.Input),
    medium = RoundedCornerShape(AppRadius.Card),
    large = RoundedCornerShape(AppRadius.Card),
    extraLarge = RoundedCornerShape(AppRadius.Card),
)

object Borders {
    val Thin = 1.dp
}
