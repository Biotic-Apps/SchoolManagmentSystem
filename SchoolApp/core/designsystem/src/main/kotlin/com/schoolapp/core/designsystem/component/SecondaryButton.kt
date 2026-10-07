package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.heightIn
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
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
    contentColor: Color = AppColors.TextPrimary,
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.heightIn(min = 52.dp),
        enabled = enabled && !loading,
        shape = MaterialTheme.shapes.small,
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 12.dp),
        border = BorderStroke(Borders.Thin, AppColors.Border),
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
