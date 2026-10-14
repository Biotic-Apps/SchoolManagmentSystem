package com.schoolapp.feature.admissions.enquiries

import androidx.compose.runtime.Composable

/** Shows the sheet or dialog [EnquiriesUiState.sheet] asks for. */
@Composable
internal fun EnquirySheetHost(state: EnquiriesUiState, viewModel: EnquiriesViewModel, onOpenApplication: (String) -> Unit) {
    when (val sheet = state.sheet) {
        null -> Unit
        EnquirySheet.Add -> EnquiryFormSheet(state, viewModel)
        is EnquirySheet.Details -> EnquiryDetailsSheet(
            enquiry = sheet.enquiry,
            access = state.access,
            onUpdate = { viewModel.open(EnquirySheet.Update(sheet.enquiry)) },
            onConvert = { viewModel.open(EnquirySheet.Convert(sheet.enquiry)) },
            onOpenApplication = { id ->
                viewModel.dismissSheet()
                onOpenApplication(id)
            },
            onDismiss = viewModel::dismissSheet,
        )
        is EnquirySheet.Update -> EnquiryUpdateSheet(
            enquiry = sheet.enquiry,
            busy = state.busy,
            error = state.actionError,
            onSave = { status, date, notes -> viewModel.update(sheet.enquiry, status, date, notes) },
            onDismiss = viewModel::dismissSheet,
        )
        is EnquirySheet.Convert -> ConvertEnquiryDialog(
            enquiry = sheet.enquiry,
            busy = state.busy,
            error = state.actionError,
            onConvert = { gender, dob -> viewModel.convert(sheet.enquiry, gender, dob) },
            onDismiss = viewModel::dismissSheet,
        )
    }
}
