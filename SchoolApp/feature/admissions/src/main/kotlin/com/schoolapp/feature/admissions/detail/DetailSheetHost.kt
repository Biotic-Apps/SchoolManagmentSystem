package com.schoolapp.feature.admissions.detail

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.feature.admissions.R

/** Shows the dialog or sheet [ApplicationDetailUiState.sheet] asks for. */
@Composable
internal fun DetailSheetHost(state: ApplicationDetailUiState, today: String, viewModel: ApplicationDetailViewModel) {
    val app = state.application ?: return
    val busy = state.busy
    val error = state.actionError
    when (val sheet = state.sheet) {
        null -> Unit
        DetailSheet.ScheduleTest -> ScheduleTestSheet(app.test, today, busy, error, viewModel::scheduleTest, viewModel::dismissSheet)
        DetailSheet.TestResult -> TestResultSheet(app.test, busy, error, viewModel::recordResult, viewModel::dismissSheet)
        DetailSheet.Upload -> UploadDocumentSheet(busy, error, viewModel::upload, viewModel::dismissSheet)
        is DetailSheet.Decide -> DecisionDialog(sheet.decision, busy, error, { viewModel.decide(sheet.decision, it) }, viewModel::dismissSheet)
        DetailSheet.Withdraw -> ReasonDialog(
            title = stringResource(R.string.admissions_withdraw_title, app.applicationNo ?: app.childName),
            message = stringResource(R.string.admissions_withdraw_message),
            confirmLabel = stringResource(R.string.admissions_withdraw),
            busy = busy,
            error = error,
            required = true,
            destructive = true,
            onConfirm = viewModel::withdraw,
            onDismiss = viewModel::dismissSheet,
        )
        is DetailSheet.Verify -> ReasonDialog(
            title = stringResource(R.string.admissions_verify_title, docTypeLabel(sheet.document.docType)),
            message = stringResource(R.string.admissions_verify_message),
            label = stringResource(R.string.admissions_document_note),
            confirmLabel = stringResource(R.string.admissions_verify),
            busy = busy,
            error = error,
            onConfirm = { viewModel.verifyDocument(sheet.document.id, it) },
            onDismiss = viewModel::dismissSheet,
        )
        is DetailSheet.Reject -> ReasonDialog(
            title = stringResource(R.string.admissions_reject_doc_title, docTypeLabel(sheet.document.docType)),
            message = stringResource(R.string.admissions_reject_doc_message),
            confirmLabel = stringResource(R.string.admissions_reject),
            busy = busy,
            error = error,
            required = true,
            destructive = true,
            onConfirm = { viewModel.rejectDocument(sheet.document.id, it) },
            onDismiss = viewModel::dismissSheet,
        )
    }
}
