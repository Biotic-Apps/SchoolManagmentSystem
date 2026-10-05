package com.schoolapp.core.designsystem.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

object AppRadius {
    val Input = 8.dp
    val Card = 12.dp
}

internal val AppShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(AppRadius.Input),
    medium = RoundedCornerShape(AppRadius.Card),
    large = RoundedCornerShape(16.dp),
    extraLarge = RoundedCornerShape(24.dp),
)

object Borders {
    val Thin = 1.dp
}
