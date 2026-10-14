package com.schoolapp.feature.students.roster

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Badge
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.Key
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.dataListItems
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.components.StudentRow
import com.schoolapp.feature.students.detail.idcard.PrintIdCardsSheet
import com.schoolapp.feature.students.loginslips.LoginSlipsSheet

@Composable
fun SectionRosterRoute(
    onBack: () -> Unit,
    onOpenStudent: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: SectionRosterViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var sheet by rememberSaveable { mutableStateOf<RosterSheet?>(null) }
    SectionRosterScreen(state, onBack, onOpenStudent, viewModel::load, modifier, onOpenSheet = { sheet = it })
    when (sheet) {
        RosterSheet.ID_CARDS -> PrintIdCardsSheet(state.branchId, state.sectionId, onPrinted = { sheet = null }, onDismiss = { sheet = null })
        RosterSheet.LOGIN_SLIPS -> LoginSlipsSheet(onDismiss = { sheet = null }, sectionId = state.sectionId)
        null -> Unit
    }
}

enum class RosterSheet { ID_CARDS, LOGIN_SLIPS }

@Composable
fun SectionRosterScreen(
    state: SectionRosterUiState,
    onBack: () -> Unit,
    onOpenStudent: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
    onOpenSheet: (RosterSheet) -> Unit = {},
) {
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.title,
                subtitle = if (state.isLoading) null else pluralStringResource(R.plurals.students_count, state.students.size, state.students.size),
                navigationIcon = { BackButton(onBack) },
                actions = {
                    if (state.canPrintCards) {
                        IconButton(onClick = { onOpenSheet(RosterSheet.ID_CARDS) }) {
                            Icon(Icons.Outlined.Badge, contentDescription = stringResource(R.string.students_print_id_cards))
                        }
                    }
                    if (state.canPrintSlips) {
                        IconButton(onClick = { onOpenSheet(RosterSheet.LOGIN_SLIPS) }) {
                            Icon(Icons.Outlined.Key, contentDescription = stringResource(R.string.students_login_slips))
                        }
                    }
                },
            )
        },
    ) { padding ->
        ScreenColumn(Modifier.padding(padding), itemSpacing = 0.dp) {
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
                else -> dataListItems(
                    items = state.students,
                    key = { it.id },
                    emptyContent = { EmptyState(stringResource(R.string.students_roster_empty), icon = Icons.Outlined.Groups) },
                ) { StudentRow(it, onClick = { onOpenStudent(it.id) }) }
            }
        }
    }
}
