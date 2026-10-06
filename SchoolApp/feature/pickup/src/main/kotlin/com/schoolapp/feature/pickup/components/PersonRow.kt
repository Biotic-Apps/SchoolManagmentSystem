package com.schoolapp.feature.pickup.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.theme.AppColors

/** Avatar + wrapping name/supporting lines + optional trailing content (status chip, radio). */
@Composable
internal fun PersonRow(
    name: String,
    supporting: String?,
    photoUrl: String?,
    modifier: Modifier = Modifier,
    trailing: (@Composable () -> Unit)? = null,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 56.dp)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        PersonAvatar(name = name, photoUrl = photoUrl)
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(name, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
            if (!supporting.isNullOrBlank()) {
                Text(supporting, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
        if (trailing != null) {
            Spacer(Modifier.width(8.dp))
            trailing()
        }
    }
}
