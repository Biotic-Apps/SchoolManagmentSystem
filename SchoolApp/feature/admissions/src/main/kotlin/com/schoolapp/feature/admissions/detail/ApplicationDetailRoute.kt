package com.schoolapp.feature.admissions.detail

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.admissions.R
import java.time.LocalDate

/** Application detail: progress, workflow actions, child, guardians, medical, entrance test and documents. */
@Composable
fun ApplicationDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    onEdit: (String) -> Unit = {},
    onConfirmAdmission: (String) -> Unit = {},
    viewModel: ApplicationDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val notice = state.notice?.let { stringResource(it) }
    LaunchedEffect(notice) {
        if (notice != null) {
            viewModel.noticeShown()
            snackbar.showSnackbar(notice)
        }
    }
    // Back from Edit or Confirm admission: show the saved state.
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { if (state.application != null) viewModel.refresh() }
    val app = state.application
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = app?.childName ?: stringResource(R.string.admissions_detail_title),
                subtitle = app?.applicationNo,
                navigationIcon = { BackButton(onBack) },
            )
        },
        snackbarHostState = snackbar,
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            app == null && state.loadError != null -> ErrorState(appErrorMessage(state.loadError!!), body, onRetry = viewModel::load)
            app == null -> LoadingState(body)
            else -> RefreshBox(isRefreshing = state.isRefreshing, onRefresh = viewModel::refresh, modifier = body) {
                val actions = state.actions
                ScreenColumn {
                    state.loadError?.let { item(key = "error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                    if (app.studentId != null) {
                        item(key = "enrolled") { InlineMessage(stringResource(R.string.admissions_student_created), StatusTone.Success) }
                    }
                    item(key = "stepper") { ApplicationStepper(app) }
                    item(key = "actions") {
                        ApplicationActionsCard(
                            actions = actions,
                            hasTest = app.test != null,
                            onOpen = viewModel::open,
                            onEdit = { onEdit(app.id) },
                            onConfirm = { onConfirmAdmission(app.id) },
                        )
                    }
                    item(key = "summary") { ApplicationSummaryCard(app) }
                    item(key = "guardians") { ApplicantGuardiansCard(app.guardians) }
                    item(key = "medical") { MedicalInfoCard(app.medical) }
                    app.test?.let { test -> item(key = "test") { AdmissionTestCard(test) } }
                    item(key = "documents") {
                        ApplicationDocumentsCard(app.documents, actions.uploadDocuments, actions.verifyDocuments, viewModel::open)
                    }
                }
            }
        }
    }
    DetailSheetHost(state, remember { LocalDate.now().toString() }, viewModel)
}
