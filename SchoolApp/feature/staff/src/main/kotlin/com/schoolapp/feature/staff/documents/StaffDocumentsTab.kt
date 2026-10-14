package com.schoolapp.feature.staff.documents

import android.content.ContentResolver
import android.net.Uri
import android.provider.OpenableColumns
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.staff.R

/**
 * Documents tab of the staff profile (web: `<DocumentsPanel ownerType="STAFF">`). Fills the area below the tabs;
 * [canEdit] = `staff.edit`, which gates upload, verify and reject.
 */
@Composable
fun StaffDocumentsTab(canEdit: Boolean, modifier: Modifier = Modifier) {
    val viewModel: StaffDocumentsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val external = rememberExternalActions()
    val snackbar = remember { SnackbarHostState() }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri: Uri? ->
        uri?.let { viewModel.onFilePicked(it.toString(), context.contentResolver.displayName(it), context.contentResolver.getType(it)) }
    }
    LaunchedEffect(viewModel) {
        viewModel.messages.collect { message -> snackbar.showSnackbar(context.getString(message.textRes())) }
    }
    Box(modifier.fillMaxSize()) {
        StaffDocumentsContent(
            state = state,
            canEdit = canEdit,
            actions = StaffDocumentsActions(
                onRefresh = { viewModel.load(refresh = true) },
                onRetry = { viewModel.load() },
                onUpload = viewModel::openUpload,
                onOpen = external::open,
                onDecide = viewModel::openDecision,
            ),
            modifier = Modifier.fillMaxSize(),
        )
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter))
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

private fun StaffDocsMessage.textRes(): Int = when (this) {
    StaffDocsMessage.UPLOADED -> R.string.staff_docs_uploaded
    StaffDocsMessage.VERIFIED -> R.string.staff_docs_verified
    StaffDocsMessage.REJECTED -> R.string.staff_docs_rejected
}

private fun ContentResolver.displayName(uri: Uri): String? = runCatching {
    query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
        if (cursor.moveToFirst()) cursor.getString(0) else null
    }
}.getOrNull() ?: uri.lastPathSegment?.substringAfterLast('/')
