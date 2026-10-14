package com.schoolapp.feature.staff.detail

import androidx.annotation.StringRes
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.account.StaffAccountUiState
import com.schoolapp.feature.staff.assignments.StaffAssignmentsTab
import com.schoolapp.feature.staff.documents.StaffDocumentsTab
import com.schoolapp.feature.staff.hrletters.StaffHrLettersTab
import com.schoolapp.feature.staff.idcard.StaffIdCardTab
import com.schoolapp.feature.staff.probation.ProbationSheet
import com.schoolapp.feature.staff.probation.ProbationUiState
import com.schoolapp.feature.staff.probation.ProbationViewModel

/** Same tabs as the web staff profile. */
internal enum class StaffDetailTab(@StringRes val title: Int) {
    PROFILE(R.string.staff_tab_profile),
    ASSIGNMENTS(R.string.staff_tab_assignments),
    DOCUMENTS(R.string.staff_tab_documents),
    ID_CARD(R.string.staff_tab_id_card),
    HR_LETTERS(R.string.staff_tab_hr_letters),
}

@Composable
internal fun StaffDetailTabContent(
    tab: StaffDetailTab,
    state: StaffDetailUiState,
    account: StaffAccountUiState,
    actions: ProfileActions,
    snackbar: SnackbarHostState,
    modifier: Modifier = Modifier,
) {
    when (tab) {
        StaffDetailTab.PROFILE -> StaffProfileTab(state, account, actions, modifier)
        StaffDetailTab.ASSIGNMENTS -> StaffAssignmentsTab(
            branchId = state.detail?.summary?.branchId,
            canEdit = state.canEdit && state.isActiveRecord,
            snackbar = snackbar,
            modifier = modifier,
        )
        StaffDetailTab.DOCUMENTS -> StaffDocumentsTab(canEdit = state.canEdit, modifier = modifier)
        StaffDetailTab.ID_CARD -> StaffIdCardTab(canGenerate = state.canEdit, modifier = modifier)
        StaffDetailTab.HR_LETTERS -> StaffHrLettersTab(canGenerate = state.canEdit, modifier = modifier)
    }
}

/** Bottom sheets opened from the profile tab. */
@Composable
internal fun StaffDetailSheets(
    detail: StaffDetail,
    state: StaffDetailUiState,
    probation: ProbationUiState,
    viewModel: StaffDetailViewModel,
    probationViewModel: ProbationViewModel,
) {
    state.statusChange?.let { sheet ->
        StatusChangeSheet(
            name = detail.summary.name,
            state = sheet,
            onStatus = viewModel::onStatus,
            onDate = viewModel::onEffectiveDate,
            onReason = viewModel::onReason,
            onSubmit = viewModel::submitStatusChange,
            onDismiss = viewModel::closeStatusChange,
        )
    }
    probation.sheet?.let { sheet ->
        ProbationSheet(
            state = sheet,
            onRequiresReview = probationViewModel::onRequiresReview,
            onReviewer = probationViewModel::onReviewer,
            onRetryReviewers = { probationViewModel.retryReviewers(detail) },
            onSubmit = probationViewModel::submit,
            onDismiss = probationViewModel::dismiss,
        )
    }
}
