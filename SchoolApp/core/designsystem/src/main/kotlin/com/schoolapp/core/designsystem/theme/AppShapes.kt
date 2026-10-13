package com.schoolapp.core.designsystem.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

/** Five radii: [Small] for icon tiles and segments, [Medium] for fields and buttons, [Large] for cards, [ExtraLarge] for dialogs and sheets, [Full] for pill buttons. */
object AppRadius {
    val Small = 12.dp
    val Medium = 16.dp
    val Large = 20.dp
    val ExtraLarge = 28.dp
    val Full = 50.dp
}

internal val AppShapes = Shapes(
    extraSmall = RoundedCornerShape(AppRadius.Small),
    small = RoundedCornerShape(AppRadius.Small),
    medium = RoundedCornerShape(AppRadius.Medium),
    large = RoundedCornerShape(AppRadius.Large),
    extraLarge = RoundedCornerShape(AppRadius.ExtraLarge),
)

object Borders {
    val Thin = 1.dp
}
