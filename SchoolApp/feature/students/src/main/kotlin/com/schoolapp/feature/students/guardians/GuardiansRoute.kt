package com.schoolapp.feature.students.guardians

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FamilyRestroom
import androidx.compose.material.icons.outlined.Link
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.dataListItems
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.components.CenteredColumn
import com.schoolapp.feature.students.components.sectionLabel

@Composable
fun GuardiansRoute(
    onOpenApprovals: (() -> Unit)?,
    modifier: Modifier = Modifier,
    viewModel: GuardiansViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    GuardiansScreen(state, viewModel::onTabSelected, viewModel::onQueryChange, viewModel::load, onOpenApprovals, modifier)
}

@Composable
fun GuardiansScreen(
    state: GuardiansUiState,
    onTabSelected: (GuardiansTab) -> Unit,
    onQueryChange: (String) -> Unit,
    onRetry: () -> Unit,
    onOpenApprovals: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    CenteredColumn(modifier) {
        AppTabs(
            titles = listOf(stringResource(R.string.students_tab_link_requests), stringResource(R.string.students_tab_guardians)),
            selectedIndex = state.tab.ordinal,
            onSelect = { onTabSelected(GuardiansTab.entries[it]) },
        )
        ScreenColumn(itemSpacing = 0.dp) {
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
                state.tab == GuardiansTab.LINK_REQUESTS -> {
                    item(key = "hint") {
                        InlineMessage(stringResource(R.string.students_link_requests_hint), StatusTone.Info, Modifier.padding(bottom = 16.dp))
                    }
                    dataListItems(
                        items = state.requests,
                        key = { it.id },
                        emptyContent = { EmptyState(stringResource(R.string.students_link_requests_empty), icon = Icons.Outlined.Link) },
                    ) { request ->
                        ListItemRow(
                            title = listOfNotNull(request.guardianName, request.studentName).joinToString(" → "),
                            supporting = listOfNotNull(
                                request.relation?.let(::humanizeKey),
                                sectionLabel(request.className, request.sectionName),
                                request.admissionNo,
                                formatTimestamp(request.createdAt),
                            ).joinToString(" · "),
                            leadingIcon = Icons.Outlined.Link,
                            onClick = onOpenApprovals,
                            trailing = request.status?.let { { StatusChip(humanizeKey(it), StatusTone.Warning) } },
                        )
                    }
                }
                else -> {
                    item(key = "search") {
                        SearchField(value = state.query, onValueChange = onQueryChange, modifier = Modifier.padding(bottom = 16.dp))
                    }
                    dataListItems(
                        items = state.guardians,
                        key = { it.id },
                        emptyContent = { EmptyState(stringResource(R.string.students_guardians_list_empty), icon = Icons.Outlined.FamilyRestroom) },
                    ) { guardian ->
                        ListItemRow(
                            title = guardian.name,
                            supporting = listOfNotNull(guardian.relation?.let(::humanizeKey), guardian.phone, guardian.email).joinToString(" · "),
                            leading = { PersonAvatar(guardian.name, null) },
                            trailing = if (guardian.hasAccount) {
                                { StatusChip(stringResource(R.string.students_has_account), StatusTone.Success) }
                            } else {
                                null
                            },
                        )
                    }
                }
            }
        }
    }
}
