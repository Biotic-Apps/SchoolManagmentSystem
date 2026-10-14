package com.schoolapp.feature.admin.schools.edit

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.admin.R

/** Logo: preview, pick an image (PNG, JPG or WebP) which uploads at once, or remove it. */
@Composable
internal fun SchoolLogoField(
    logo: LogoState,
    schoolName: String,
    onPicked: (String) -> Unit,
    onRemove: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) onPicked(uri.toString())
    }
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 12.dp) {
        Text(stringResource(R.string.schools_field_logo), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
            PersonAvatar(schoolName.ifBlank { "?" }, logo.shownUrl, size = 64.dp)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                SecondaryButton(
                    text = stringResource(if (logo.shownUrl == null) R.string.schools_logo_pick else R.string.schools_logo_change),
                    onClick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
                    loading = logo.isUploading,
                    enabled = !logo.isUploading,
                    leadingIcon = Icons.Outlined.Image,
                )
                if (logo.shownUrl != null && !logo.isUploading) {
                    AppTextButton(stringResource(R.string.schools_logo_remove), onRemove)
                }
            }
        }
        Text(stringResource(R.string.schools_logo_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        logo.uploadError?.let { InlineMessage(actionErrorMessage(it), StatusTone.Error) }
    }
}
