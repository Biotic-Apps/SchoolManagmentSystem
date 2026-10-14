package com.schoolapp.feature.students.detail.documents

import android.content.ContentResolver
import android.net.Uri
import android.provider.OpenableColumns
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CloudUpload
import androidx.compose.material.icons.outlined.FolderOpen
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.students.R

/** Documents tab (web DocumentsPanel ownerType STUDENT); [canEdit] = `students.edit` gates upload, verify and reject. */
@Composable
internal fun StudentDocumentsTab(studentId: String, canEdit: Boolean, snackbar: SnackbarHostState, modifier: Modifier = Modifier) {
    val viewModel: StudentDocumentsViewModel = hiltViewModel()
    LaunchedEffect(studentId) { viewModel.start(studentId) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val external = rememberExternalActions()
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri: Uri? ->
        uri?.let { viewModel.onFilePicked(it.toString(), context.contentResolver.displayName(it), context.contentResolver.getType(it)) }
    }
    LaunchedEffect(viewModel) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it.textRes())) } }
    val error = state.loadError
    when {
        state.isLoading -> LoadingState(modifier)
        error != null && state.documents.isEmpty() -> ErrorState(loadErrorMessage(error), modifier, onRetry = { viewModel.load() })
        else -> RefreshBox(state.isRefreshing, { viewModel.load(refresh = true) }, modifier.fillMaxSize()) {
            if (state.documents.isEmpty()) {
                PullableState {
                    EmptyState(
                        title = stringResource(R.string.sd_docs_empty_title),
                        message = if (canEdit) stringResource(R.string.sd_docs_empty_message) else null,
                        icon = Icons.Outlined.FolderOpen,
                        action = if (canEdit) ({ UploadButton(viewModel::openUpload) }) else null,
                    )
                }
            } else {
                ScreenColumn {
                    if (canEdit) item(key = "upload") { UploadButton(viewModel::openUpload, Modifier.fillMaxWidth()) }
                    items(state.documents.size, key = { state.documents[it].id }) { index ->
                        val document = state.documents[index]
                        StudentDocumentCard(document, canEdit, external::open, { kind -> viewModel.openDecision(document, kind) })
                    }
                }
            }
        }
    }
    state.upload?.takeIf { canEdit }?.let { form ->
        DocumentUploadSheet(
            form = form,
            actions = UploadSheetActions(
                onTypeChange = viewModel::onTypeChange,
                onPickFile = { picker.launch(arrayOf("image/*", DocumentUploadForm.PDF)) },
                onNoteChange = viewModel::onNoteChange,
                onSubmit = viewModel::submitUpload,
                onDismiss = viewModel::closeUpload,
            ),
        )
    }
    state.decision?.takeIf { canEdit }?.let { decision ->
        DocumentDecisionDialog(decision, viewModel::onDecisionTextChange, viewModel::confirmDecision, viewModel::closeDecision)
    }
}

@Composable
private fun UploadButton(onClick: () -> Unit, modifier: Modifier = Modifier) {
    SecondaryButton(stringResource(R.string.sd_docs_upload), onClick, modifier, leadingIcon = Icons.Outlined.CloudUpload)
}

private fun DocsMessage.textRes(): Int = when (this) {
    DocsMessage.UPLOADED -> R.string.sd_docs_uploaded
    DocsMessage.VERIFIED -> R.string.sd_docs_verified
    DocsMessage.REJECTED -> R.string.sd_docs_rejected
}

private fun ContentResolver.displayName(uri: Uri): String? = runCatching {
    query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
        if (cursor.moveToFirst()) cursor.getString(0) else null
    }
}.getOrNull() ?: uri.lastPathSegment?.substringAfterLast('/')
