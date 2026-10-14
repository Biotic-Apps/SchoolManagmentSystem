package com.schoolapp.feature.students.detail

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Print
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.detail.idcard.PrintIdCardsSheet
import com.schoolapp.feature.students.manage.ManageController
import com.schoolapp.feature.students.manage.ManageSheetHost
import kotlinx.coroutines.launch

@Composable
fun StudentDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: StudentDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    StudentDetailScreen(state, onBack, viewModel::load, modifier, viewModel.manage, viewModel::noticeShown)
}

@Composable
fun StudentDetailScreen(
    state: StudentDetailUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
    manage: ManageController? = null,
    onNoticeShown: () -> Unit = {},
) {
    val snackbar = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    var tabName by rememberSaveable { mutableStateOf(StudentDetailTab.PROFILE.name) }
    var printing by rememberSaveable { mutableStateOf(false) }
    val detail = state.detail
    AppScaffold(
        modifier = modifier,
        snackbarHostState = snackbar,
        topBar = {
            AppTopBar(
                title = detail?.summary?.name ?: stringResource(R.string.students_detail_title),
                navigationIcon = { BackButton(onBack) },
                actions = {
                    if (detail != null && state.canEditStudent) {
                        IconButton(onClick = { printing = true }) {
                            Icon(Icons.Outlined.Print, stringResource(R.string.sd_print_cards), tint = AppColors.TextPrimary)
                        }
                    }
                },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(body)
            state.error != null && detail == null -> ErrorState(appErrorMessage(state.error), body, onRetry = onRetry)
            detail != null -> Column(body.fillMaxSize()) {
                val tabs = state.visibleTabs()
                val selected = tabs.firstOrNull { it.name == tabName } ?: StudentDetailTab.PROFILE
                AppTabs(
                    titles = tabs.map { stringResource(it.title) },
                    selectedIndex = tabs.indexOf(selected),
                    onSelect = { tabName = tabs[it].name },
                )
                StudentDetailTabContent(selected, detail, state, manage, onNoticeShown, snackbar, Modifier.weight(1f))
            }
        }
    }
    if (manage != null) ManageSheetHost(state.sheet, state.today, manage)
    if (printing && detail != null) {
        PrintIdCardsSheet(
            branchId = detail.enrollment?.branchId,
            sectionId = detail.enrollment?.sectionId ?: detail.summary.sectionId,
            onPrinted = { count ->
                printing = false
                scope.launch { snackbar.showSnackbar(context.resources.getQuantityString(R.plurals.sd_print_ready, count, count)) }
            },
            onDismiss = { printing = false },
        )
    }
}
