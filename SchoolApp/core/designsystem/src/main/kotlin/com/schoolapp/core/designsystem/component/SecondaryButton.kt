package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.heightIn
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.motion.pressScale
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.Borders

@Composable
fun SecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false,
    leadingIcon: ImageVector? = null,
    contentColor: Color = AppColors.Primary,
) {
    val interaction = remember { MutableInteractionSource() }
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.heightIn(min = 52.dp).pressScale(interaction, enabled && !loading),
        interactionSource = interaction,
        enabled = enabled && !loading,
        shape = RoundedCornerShape(50),
        contentPadding = PaddingValues(horizontal = 24.dp, vertical = 10.dp),
        border = BorderStroke(Borders.Thin, AppColors.Primary),
        colors = ButtonDefaults.outlinedButtonColors(
            containerColor = AppColors.Surface,
            contentColor = contentColor,
            disabledContentColor = AppColors.TextSecondary,
        ),
    ) {
        ButtonContent(text, loading, contentColor, leadingIcon)
    }
}

@Preview
@Composable
private fun SecondaryButtonPreview() = PreviewContainer {
    SecondaryButton(text = "Cancel", onClick = {})
}
