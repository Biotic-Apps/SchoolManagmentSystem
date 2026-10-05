package com.schoolapp.core.designsystem.component

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import com.schoolapp.core.designsystem.theme.AppColors

/** Icon button with a count badge (hidden at zero, capped at 99+). */
@Composable
fun BadgedIconButton(
    icon: ImageVector,
    count: Int,
    contentDescription: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    IconButton(onClick = onClick, modifier = modifier.semantics { this.contentDescription = contentDescription }) {
        BadgedBox(
            badge = {
                if (count > 0) {
                    Badge(containerColor = AppColors.Primary, contentColor = AppColors.OnPrimary) {
                        Text(if (count > MAX_SHOWN) "$MAX_SHOWN+" else count.toString())
                    }
                }
            },
        ) {
            Icon(icon, contentDescription = null)
        }
    }
}

private const val MAX_SHOWN = 99

@Preview
@Composable
private fun BadgedIconButtonPreview() = PreviewContainer {
    BadgedIconButton(Icons.Outlined.Notifications, count = 3, contentDescription = "Notifications", onClick = {})
}
