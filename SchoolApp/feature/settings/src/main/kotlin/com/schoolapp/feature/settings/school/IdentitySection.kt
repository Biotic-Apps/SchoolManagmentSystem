package com.schoolapp.feature.settings.school

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Upload
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.brand.BrandMark
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.settings.R

/** Logo upload / remove and the display name. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun IdentitySection(
    state: SchoolBrandingUiState,
    canEdit: Boolean,
    onUpload: (String) -> Unit,
    onEdit: ((SchoolForm) -> SchoolForm) -> Unit,
) {
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let { onUpload(it.toString()) }
    }
    val form = state.form
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionHeader(
            title = stringResource(R.string.settings_school_identity),
            subtitle = stringResource(R.string.settings_school_identity_hint),
        )
        Text(stringResource(R.string.settings_school_logo), style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
            BrandMark(logoUrl = form.logoUrl.takeIf { form.logoFileId != null }, size = LOGO_SIZE)
            FlowRow(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                AppTextButton(
                    text = stringResource(
                        if (form.logoFileId == null) R.string.settings_school_logo_upload else R.string.settings_school_logo_replace,
                    ),
                    onClick = { picker.launch(IMAGE_MIME) },
                    enabled = canEdit && !state.uploadingLogo,
                    loading = state.uploadingLogo,
                    leadingIcon = Icons.Outlined.Upload,
                )
                if (form.logoFileId != null) {
                    AppTextButton(
                        text = stringResource(R.string.settings_school_logo_remove),
                        onClick = { onEdit { it.copy(logoFileId = null, logoUrl = null) } },
                        enabled = canEdit && !state.uploadingLogo,
                        leadingIcon = Icons.Outlined.Delete,
                        contentColor = AppColors.Error,
                    )
                }
            }
        }
        val logoError = state.logoError?.let { appErrorMessage(it) } ?: state.serverErrors["logoFileId"]
        Text(
            text = logoError ?: stringResource(R.string.settings_school_logo_hint),
            style = MaterialTheme.typography.bodySmall,
            color = if (logoError != null) AppColors.Error else AppColors.TextSecondary,
        )
        AppTextField(
            value = form.displayName,
            onValueChange = { value -> if (value.length <= NAME_MAX) onEdit { it.copy(displayName = value) } },
            label = stringResource(R.string.settings_school_display_name),
            enabled = canEdit,
            kind = FieldKind.Title,
            errorText = if (state.nameMissing) stringResource(R.string.settings_school_display_name_required) else state.serverErrors["displayName"],
        )
    }
}

private const val IMAGE_MIME = "image/*"
private const val NAME_MAX = 120
private val LOGO_SIZE = 64.dp
