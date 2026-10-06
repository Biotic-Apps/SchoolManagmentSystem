package com.schoolapp.feature.admissions.list

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Assignment
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.DataList
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.admissions.ApplicationStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.admissions.R

@Composable
fun AdmissionsRoute(
    onOpenApplication: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: AdmissionsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AdmissionsScreen(state, viewModel::onFilter, onOpenApplication, viewModel::load, modifier)
}

@Composable
fun AdmissionsScreen(
    state: AdmissionsUiState,
    onFilter: (ApplicationStatus?) -> Unit,
    onOpenApplication: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxSize()) {
        when {
            state.isLoading -> LoadingState()
            state.error != null -> ErrorState(appErrorMessage(state.error), onRetry = onRetry)
            else -> {
                val all = SwitcherOption(ALL, stringResource(R.string.admissions_all, state.applications.size))
                val options = listOf(all) + state.counts.map { (status, count) ->
                    SwitcherOption(status.name, stringResource(R.string.admissions_status_count, humanizeKey(status.name), count))
                }
                FilterChipRow(
                    options = options,
                    selectedId = state.filter?.name ?: ALL,
                    onSelect = { id -> onFilter(if (id == ALL) null else ApplicationStatus.valueOf(id)) },
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                )
                InlineMessage(stringResource(R.string.admissions_web_hint), StatusTone.Info, Modifier.padding(horizontal = 16.dp))
                DataList(
                    items = state.visible,
                    key = { it.id },
                    modifier = Modifier.padding(16.dp),
                    emptyContent = { EmptyState(stringResource(R.string.admissions_empty), icon = Icons.AutoMirrored.Outlined.Assignment) },
                ) { app ->
                    ListItemRow(
                        title = app.childName,
                        supporting = listOfNotNull(app.className, app.applicationNo, formatDate(app.createdAt)).joinToString(" · "),
                        leadingIcon = Icons.AutoMirrored.Outlined.Assignment,
                        onClick = { onOpenApplication(app.id) },
                        trailing = { StatusChip(humanizeKey(app.status.name), statusTone(app.status.name)) },
                    )
                }
            }
        }
    }
}

private const val ALL = "ALL"
