package com.schoolapp.feature.admin.schools.delete

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DeleteForever
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.AdminFormMaxWidth

@Composable
internal fun DeleteSchoolRoute(
    onBack: () -> Unit,
    onDeleted: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: DeleteSchoolViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.deleted) { if (state.deleted) onDeleted() }
    // Leaving while the job runs would hide its outcome; the server finishes it either way.
    BackHandler(enabled = state.isRunning) {}
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.schools_delete_permanently),
                navigationIcon = { if (!state.isRunning) BackButton(onBack) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        val preview = state.preview
        when {
            state.isLoading -> LoadingState(body)
            preview == null -> ErrorState(state.previewError?.let { loadErrorMessage(it) }.orEmpty(), body, onRetry = viewModel::loadPreview)
            else -> ScreenColumn(body, maxWidth = AdminFormMaxWidth, itemSpacing = 12.dp) {
                item(key = "title") {
                    Text(
                        stringResource(R.string.schools_delete_title, preview.name),
                        style = MaterialTheme.typography.titleLarge,
                        color = AppColors.TextPrimary,
                    )
                }
                item(key = "intro") {
                    Text(stringResource(R.string.schools_delete_message), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                }
                item(key = "preview") { DeletionPreviewCard(preview) }
                item(key = "warning") {
                    Text(
                        stringResource(R.string.schools_delete_undo),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = AppColors.Error,
                    )
                }
                if (preview.status == "ACTIVE") {
                    item(key = "archive_hint") {
                        Text(stringResource(R.string.schools_delete_archive_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                    }
                }
                item(key = "confirm") {
                    AppTextField(
                        value = state.confirmText,
                        onValueChange = viewModel::onConfirmTextChange,
                        label = stringResource(R.string.schools_delete_type_code, preview.code),
                        enabled = !state.isRunning,
                        kind = FieldKind.Code,
                        imeAction = ImeAction.Done,
                        onImeAction = viewModel::delete,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
                if (state.isRunning) {
                    item(key = "running") { InlineMessage(stringResource(R.string.schools_delete_running, preview.name), StatusTone.Info) }
                }
                state.requestError?.let { error -> item(key = "error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) } }
                if (state.failed) {
                    item(key = "failed") {
                        val detail = state.failureDetail.orEmpty()
                        InlineMessage(stringResource(R.string.schools_delete_failed, detail).trim(), StatusTone.Error)
                    }
                }
                item(key = "button") {
                    Button(
                        onClick = viewModel::delete,
                        enabled = state.matches && !state.isRunning,
                        colors = ButtonDefaults.buttonColors(containerColor = AppColors.Error, contentColor = AppColors.OnPrimary),
                        modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp).padding(top = 4.dp),
                    ) {
                        if (state.isRunning) {
                            CircularProgressIndicator(Modifier.size(18.dp), color = AppColors.OnPrimary, strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.Outlined.DeleteForever, contentDescription = null, modifier = Modifier.size(18.dp))
                        }
                        Spacer(Modifier.width(8.dp))
                        Text(stringResource(R.string.schools_delete_permanently))
                    }
                }
            }
        }
    }
}
