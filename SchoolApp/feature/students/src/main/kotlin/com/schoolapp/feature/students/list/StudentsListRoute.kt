package com.schoolapp.feature.students.list

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.detail.idcard.PrintIdCardsSheet
import com.schoolapp.feature.students.components.CenteredColumn
import com.schoolapp.feature.students.loginslips.LoginSlipsSheet
import com.schoolapp.feature.students.transfers.TransfersTab

/**
 * Students for principal, super admin, coordinator, accountant and other branch roles (web StudentsPage):
 * a filtered, paged list (class, section, status, search) and the transfers inbox.
 */
@Composable
fun StudentsListRoute(
    onOpenStudent: (String) -> Unit,
    onAddStudent: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: StudentsListViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val students by viewModel.students.state.collectAsStateWithLifecycle()
    CenteredColumn(modifier) {
        AppTabs(
            titles = listOf(stringResource(R.string.students_tab_students), stringResource(R.string.students_tab_transfers)),
            selectedIndex = state.tab.ordinal,
            onSelect = { viewModel.onTab(StudentsTab.entries[it]) },
        )
        when (state.tab) {
            StudentsTab.STUDENTS -> StudentsTabContent(
                state = state,
                paged = students,
                actions = StudentsTabActions(
                    onQueryChange = viewModel::onQueryChange,
                    onClass = viewModel::onClass,
                    onSection = viewModel::onSection,
                    onStatus = viewModel::onStatus,
                    onRefresh = viewModel.students::refresh,
                    onRetry = { if (state.scopeError != null) viewModel.loadScope() else viewModel.students.reload() },
                    onLoadMore = viewModel.students::loadMore,
                    onOpenStudent = onOpenStudent,
                    onAddStudent = onAddStudent,
                    onPrintSlips = { viewModel.showLoginSlips(true) },
                    onPrintCards = { viewModel.showIdCards(true) },
                ),
            )
            StudentsTab.TRANSFERS -> TransfersTab()
        }
    }
    if (state.showLoginSlips) LoginSlipsSheet(onDismiss = { viewModel.showLoginSlips(false) }, sectionId = state.filter.sectionId)
    if (state.showIdCards) {
        PrintIdCardsSheet(
            branchId = state.filter.branchId,
            sectionId = state.filter.sectionId,
            onPrinted = { viewModel.showIdCards(false) },
            onDismiss = { viewModel.showIdCards(false) },
        )
    }
}
