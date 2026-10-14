package com.schoolapp.feature.admissions.detail

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AttachFile
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.admissions.R

/** Upload one document (birth certificate, B-Form, previous result...) to the application. */
@Composable
internal fun UploadDocumentSheet(
    busy: Boolean,
    error: AppError?,
    onSubmit: (docType: String, fileUri: String, note: String) -> Unit,
    onDismiss: () -> Unit,
) {
    var docType by rememberSaveable { mutableStateOf("") }
    var fileUri by rememberSaveable { mutableStateOf("") }
    var note by rememberSaveable { mutableStateOf("") }
    var tried by rememberSaveable { mutableStateOf(false) }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri -> uri?.let { fileUri = it.toString() } }
    AppBottomSheet(title = stringResource(R.string.admissions_upload_document), onDismiss = onDismiss) {
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            val typeMissing = tried && docType.isBlank()
            Text(
                stringResource(R.string.admissions_document_type),
                style = MaterialTheme.typography.labelMedium,
                color = if (typeMissing) AppColors.Error else AppColors.TextSecondary,
            )
            FilterChipRow(
                options = DOC_TYPES.map { SwitcherOption(it, docTypeLabel(it)) },
                selectedId = docType.ifBlank { null },
                onSelect = { docType = it },
            )
            if (typeMissing) Text(stringResource(R.string.admissions_required), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        }
        SecondaryButton(
            text = if (fileUri.isBlank()) stringResource(R.string.admissions_choose_file) else stringResource(R.string.admissions_change_file),
            onClick = { picker.launch(ANY_FILE) },
            leadingIcon = Icons.Outlined.AttachFile,
            enabled = !busy,
            modifier = Modifier.fillMaxWidth(),
        )
        if (fileUri.isNotBlank()) {
            Text(Uri.parse(fileUri).lastPathSegment.orEmpty(), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        } else if (tried) {
            Text(stringResource(R.string.admissions_file_required), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        }
        AppTextField(note, { note = it.take(NOTE_MAX) }, stringResource(R.string.admissions_document_note),
            supportingText = stringResource(R.string.admissions_new_optional))
        error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        PrimaryButton(
            text = stringResource(R.string.admissions_upload),
            onClick = {
                tried = true
                if (docType.isNotBlank() && fileUri.isNotBlank()) onSubmit(docType, fileUri, note)
            },
            loading = busy,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

private const val ANY_FILE = "*/*"
private const val NOTE_MAX = 255
