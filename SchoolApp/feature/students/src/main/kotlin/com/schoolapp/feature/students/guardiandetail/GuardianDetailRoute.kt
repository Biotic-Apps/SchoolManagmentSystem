package com.schoolapp.feature.students.guardiandetail

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.students.R

/** Guardian page: details, parent sign-in and linked children; [onOpenStudent] opens a child's profile. */
@Composable
fun GuardianDetailRoute(
    onBack: () -> Unit,
    onOpenStudent: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: GuardianDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    LaunchedEffect(state.notice) {
        val notice = state.notice ?: return@LaunchedEffect
        viewModel.noticeShown()
        snackbar.showSnackbar(noticeText(context, notice, state.detail?.guardian?.name.orEmpty()))
    }
    AppScaffold(
        modifier = modifier,
        snackbarHostState = snackbar,
        topBar = {
            AppTopBar(
                title = state.detail?.guardian?.name ?: stringResource(R.string.students_guardian),
                navigationIcon = { BackButton(onBack) },
                actions = {
                    if (state.canEdit && state.detail != null) {
                        IconButton(onClick = viewModel.sheets::openEdit) {
                            Icon(Icons.Outlined.Edit, contentDescription = stringResource(R.string.students_edit_guardian))
                        }
                    }
                },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        val detail = state.detail
        when {
            state.isLoading && detail == null -> LoadingState(body)
            detail == null -> ErrorState(appErrorMessage(state.error!!), body, onRetry = viewModel::load)
            else -> RefreshBox(state.isLoading, viewModel::load, body) {
                ScreenColumn {
                    item(key = "info") { GuardianInfoCard(detail) }
                    item(key = "signin") {
                        GuardianSignInCard(
                            state = state,
                            onCreate = { viewModel.askSignIn(SignInAction.CREATE) },
                            onReset = { viewModel.askSignIn(SignInAction.RESET) },
                            onSend = viewModel::sendSignIn,
                            onDismissError = viewModel::dismissError,
                        )
                    }
                    item(key = "children") {
                        GuardianChildrenCard(
                            children = detail.children,
                            canUnlink = state.canEdit,
                            onOpenStudent = onOpenStudent,
                            onUnlink = viewModel.sheets::openUnlink,
                        )
                    }
                }
            }
        }
    }
    GuardianOverlays(state, viewModel)
}

private fun noticeText(context: android.content.Context, notice: GuardianNotice, name: String): String = when (notice) {
    GuardianNotice.Saved -> context.getString(R.string.students_guardian_saved)
    GuardianNotice.Unlinked -> context.getString(R.string.students_child_unlinked)
    is GuardianNotice.Sent -> context.getString(
        R.string.students_sign_in_sent,
        name,
        notice.channels.joinToString(context.getString(R.string.students_and)) { if (it == "SMS") "SMS" else context.getString(R.string.students_email) },
    )
}
