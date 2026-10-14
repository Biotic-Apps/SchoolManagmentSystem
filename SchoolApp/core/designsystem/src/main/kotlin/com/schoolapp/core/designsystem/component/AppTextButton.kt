package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.heightIn
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppButtonShape
import com.schoolapp.core.designsystem.theme.AppColors

@Composable
fun AppTextButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false,
    leadingIcon: ImageVector? = null,
    contentColor: Color = AppColors.Primary,
) {
    TextButton(
        onClick = onClick,
        modifier = modifier.heightIn(min = 48.dp),
        enabled = enabled && !loading,
        shape = AppButtonShape,
        colors = ButtonDefaults.textButtonColors(
            contentColor = contentColor,
            disabledContentColor = AppColors.TextSecondary,
        ),
    ) {
        ButtonContent(text, loading, contentColor, leadingIcon)
    }
}

@Preview
@Composable
private fun AppTextButtonPreview() = PreviewContainer {
    AppTextButton(text = "Forgot password?", onClick = {})
}
