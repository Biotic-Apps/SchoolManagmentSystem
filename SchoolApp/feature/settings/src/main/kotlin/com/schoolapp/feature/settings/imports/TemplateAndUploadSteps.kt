package com.schoolapp.feature.settings.imports

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.Upload
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.settings.R
import java.util.Locale

/** Step 2: save the .xlsx template of the chosen kind where the user picks. */
@Composable
internal fun TemplateStep(state: ImportFlowUiState, onSave: (String) -> Unit) {
    val saver = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument(XLSX)) { uri ->
        uri?.let { onSave(it.toString()) }
    }
    val kindName = stringResource(state.kind.label)
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
            stringResource(R.string.settings_imports_template_hint, kindName.lowercase(Locale.getDefault())),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        SecondaryButton(
            text = stringResource(R.string.settings_imports_template_download),
            onClick = { saver.launch("${state.kind.key.lowercase(Locale.ROOT)}-template.xlsx") },
            loading = state.templateSaving,
            leadingIcon = Icons.Outlined.Download,
        )
        if (state.templateResult == TemplateResult.SAVED) {
            InlineMessage(stringResource(R.string.settings_imports_template_saved), StatusTone.Success)
        }
        state.templateError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
    }
}

/** Step 3: pick the filled .xlsx / .csv; it is validated on the server right after upload. */
@Composable
internal fun UploadStep(state: ImportFlowUiState, onPick: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        PrimaryButton(
            text = stringResource(if (state.importId != null) R.string.settings_imports_upload_another else R.string.settings_imports_upload),
            onClick = onPick,
            enabled = state.ready && !state.busy,
            loading = state.uploading,
            leadingIcon = Icons.Outlined.Upload,
        )
        state.shownFileName?.let { name ->
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Outlined.Description, contentDescription = null, tint = AppColors.Primary)
                Text(name, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
            }
        }
        val error = state.uploadError
        if (error != null) {
            InlineMessage(appErrorMessage(error), StatusTone.Error)
        } else {
            Text(stringResource(R.string.settings_imports_upload_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
    }
}

private const val XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
internal val UPLOAD_TYPES = arrayOf(
    XLSX,
    "text/csv",
    "text/comma-separated-values",
    "application/vnd.ms-excel",
    "application/octet-stream",
)
