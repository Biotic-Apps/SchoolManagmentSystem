package com.schoolapp.core.designsystem.component

import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import com.schoolapp.core.designsystem.theme.AppButtonShape
import com.schoolapp.core.designsystem.theme.AppColors

/** Primary screen action floating above lists ("New message", "File complaint"). */
@Composable
fun AppFloatingButton(
    text: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    ExtendedFloatingActionButton(
        onClick = onClick,
        modifier = modifier,
        containerColor = AppColors.Primary,
        contentColor = AppColors.OnPrimary,
        shape = AppButtonShape,
        icon = { Icon(icon, contentDescription = null) },
        text = { Text(text, style = MaterialTheme.typography.labelLarge) },
    )
}
