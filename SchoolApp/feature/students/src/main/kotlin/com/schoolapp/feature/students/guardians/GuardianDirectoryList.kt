package com.schoolapp.feature.students.guardians

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FamilyRestroom
import androidx.compose.material.icons.outlined.Key
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.people.Guardian
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.paging.LoadMoreOnScroll
import com.schoolapp.feature.students.paging.Paged
import com.schoolapp.feature.students.paging.pagedItems

/** Searchable, paged guardian directory; a row opens the guardian's detail. */
@Composable
internal fun GuardianDirectoryList(
    state: GuardiansUiState,
    paged: Paged<Guardian>,
    onQueryChange: (String) -> Unit,
    onRefresh: () -> Unit,
    onRetry: () -> Unit,
    onLoadMore: () -> Unit,
    onOpenGuardian: (String) -> Unit,
    onPrintSlips: () -> Unit,
) {
    val listState = rememberLazyListState()
    LoadMoreOnScroll(listState, onLoadMore)
    RefreshBox(paged.isRefreshing, onRefresh) {
        ScreenColumn(itemSpacing = 0.dp, state = listState) {
            if (state.canPrintSlips) {
                item(key = "slips") {
                    SecondaryButton(
                        stringResource(R.string.students_login_slips), onPrintSlips,
                        Modifier.padding(bottom = 12.dp), leadingIcon = Icons.Outlined.Key,
                    )
                }
            }
            item(key = "search") {
                SearchField(
                    value = state.query,
                    onValueChange = onQueryChange,
                    placeholder = stringResource(R.string.students_guardians_search_hint),
                    modifier = Modifier.padding(bottom = 16.dp),
                )
            }
            pagedItems(
                paged = paged,
                key = { it.id },
                onRetry = onRetry,
                onLoadMore = onLoadMore,
                empty = { EmptyState(stringResource(R.string.students_guardians_list_empty), icon = Icons.Outlined.FamilyRestroom) },
            ) { guardian ->
                ListItemRow(
                    title = guardian.name,
                    supporting = listOfNotNull(guardian.relation?.let(::humanizeKey), guardian.phone, guardian.email).joinToString(" · "),
                    leading = { PersonAvatar(guardian.name, null) },
                    onClick = { onOpenGuardian(guardian.id) },
                    trailing = {
                        if (guardian.hasAccount) {
                            StatusChip(stringResource(R.string.students_has_account), StatusTone.Success)
                        } else {
                            StatusChip(stringResource(R.string.students_no_sign_in), StatusTone.Neutral)
                        }
                    },
                )
            }
        }
    }
}
