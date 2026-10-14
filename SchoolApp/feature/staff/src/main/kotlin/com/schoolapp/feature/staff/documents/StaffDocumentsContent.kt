package com.schoolapp.feature.staff.documents

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CloudUpload
import androidx.compose.material.icons.outlined.FolderOpen
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.model.staff.documents.StaffDocument
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.staff.R

internal data class StaffDocumentsActions(
    val onRefresh: () -> Unit,
    val onRetry: () -> Unit,
    val onUpload: () -> Unit,
    val onOpen: (String) -> Unit,
    val onDecide: (StaffDocument, DecisionKind) -> Unit,
)

@Composable
internal fun StaffDocumentsContent(state: StaffDocumentsUiState, canEdit: Boolean, actions: StaffDocumentsActions, modifier: Modifier = Modifier) {
    val error = state.loadError
    when {
        state.isLoading -> LoadingState(modifier)
        error != null && state.documents.isEmpty() -> ErrorState(appErrorMessage(error), modifier, onRetry = actions.onRetry)
        else -> RefreshBox(isRefreshing = state.isRefreshing, onRefresh = actions.onRefresh, modifier = modifier) {
            if (state.documents.isEmpty()) {
                PullableState {
                    EmptyState(
                        title = stringResource(R.string.staff_docs_empty_title),
                        message = if (canEdit) stringResource(R.string.staff_docs_empty_message) else null,
                        icon = Icons.Outlined.FolderOpen,
                        action = if (canEdit) ({ UploadButton(actions.onUpload) }) else null,
                    )
                }
            } else {
                DocumentList(state.documents, canEdit, actions)
            }
        }
    }
}

@Composable
private fun DocumentList(documents: List<StaffDocument>, canEdit: Boolean, actions: StaffDocumentsActions) {
    ScreenColumn {
        if (canEdit) item(key = "upload") { UploadButton(actions.onUpload, Modifier.fillMaxWidth()) }
        items(documents.size, key = { documents[it].id }) { index ->
            val document = documents[index]
            StaffDocumentCard(
                document = document,
                canEdit = canEdit,
                onOpen = actions.onOpen,
                onDecide = { kind -> actions.onDecide(document, kind) },
            )
        }
    }
}

@Composable
private fun UploadButton(onClick: () -> Unit, modifier: Modifier = Modifier) {
    SecondaryButton(stringResource(R.string.staff_docs_upload), onClick, modifier, leadingIcon = Icons.Outlined.CloudUpload)
}
