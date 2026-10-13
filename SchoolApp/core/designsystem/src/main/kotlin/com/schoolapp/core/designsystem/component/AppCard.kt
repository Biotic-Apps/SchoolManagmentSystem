package com.schoolapp.core.designsystem.component

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.motion.pressScale
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.AppMotion
import com.schoolapp.core.designsystem.theme.Borders

/**
 * The one card of the app: white surface, soft border, 20dp corners, gentle shadow.
 * - [onClick]: ripple plus a slight press scale; the border warms to purple while pressed.
 * - [selected]: lavender fill with a purple border (chosen option, "now" row).
 * - [tone]: tinted alert card (error, warning...) — tone container fill with a soft tone border.
 * - [animateSize] (default on): content that grows or shrinks (errors, expanding parts) animates its height.
 */
@Composable
fun AppCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    selected: Boolean = false,
    tone: StatusTone? = null,
    enabled: Boolean = true,
    contentPadding: Dp = 16.dp,
    verticalSpacing: Dp = 0.dp,
    animateSize: Boolean = true,
    content: @Composable ColumnScope.() -> Unit,
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val colors = cardColors(selected = selected, pressed = pressed && onClick != null, tone = tone)
    val shape = MaterialTheme.shapes.large           // 20dp corners — premium feel
    val border = if (selected || tone != null) BorderStroke(Borders.Thin, colors.border) else null
    val cardShadow = 4.dp                            // soft shadow for depth
    val body: @Composable () -> Unit = {
        CompositionLocalProvider(LocalInsetContent provides true) {
            Column(
                modifier = Modifier
                    .then(if (animateSize) Modifier.animateContentSize(AppMotion.standard()) else Modifier)
                    .padding(contentPadding),
                verticalArrangement = Arrangement.spacedBy(verticalSpacing),
                content = content,
            )
        }
    }
    if (onClick != null) {
        Surface(
            onClick = onClick,
            modifier = modifier
                .shadow(cardShadow, shape, clip = false)
                .pressScale(interaction, enabled),
            enabled = enabled,
            shape = shape,
            color = colors.container,
            border = border,
            tonalElevation = 0.dp,
            shadowElevation = cardShadow,
            interactionSource = interaction,
            content = body,
        )
    } else {
        Surface(
            modifier = modifier.shadow(cardShadow, shape, clip = false),
            shape = shape,
            color = colors.container,
            border = border,
            tonalElevation = 0.dp,
            shadowElevation = cardShadow,
            content = body,
        )
    }
}

@Preview
@Composable
private fun AppCardPreview() = PreviewContainer {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        AppCard(onClick = {}) {
            Text("Class 5 - Section A", style = MaterialTheme.typography.titleLarge)
            Text("32 students", style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        AppCard(selected = true) { Text("Period 3 · now", style = MaterialTheme.typography.titleMedium) }
        Row { AppCard(tone = StatusTone.Error) { Text("Allergies: peanuts", color = AppColors.Error) } }
    }
}
