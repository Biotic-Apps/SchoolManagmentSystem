package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.heightIn
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors

@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false,
    leadingIcon: ImageVector? = null,
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    Button(
        onClick = onClick,
        modifier = modifier.heightIn(min = 52.dp),
        interactionSource = interaction,
        enabled = enabled && !loading,
        shape = MaterialTheme.shapes.small,
        contentPadding = PaddingValues(horizontal = 20.dp, vertical = 12.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (pressed) AppColors.PrimaryPressed else AppColors.Primary,
            contentColor = AppColors.OnPrimary,
            disabledContainerColor = if (loading) AppColors.Primary else AppColors.Border,
            disabledContentColor = if (loading) AppColors.OnPrimary else AppColors.TextSecondary,
        ),
        elevation = null,
    ) {
        ButtonContent(text, loading, AppColors.OnPrimary, leadingIcon)
    }
}

@Preview
@Composable
private fun PrimaryButtonPreview() = PreviewContainer {
    PrimaryButton(text = "Sign in", onClick = {})
}

@Preview
@Composable
private fun PrimaryButtonLoadingPreview() = PreviewContainer {
    PrimaryButton(text = "Sign in", onClick = {}, loading = true)
}
