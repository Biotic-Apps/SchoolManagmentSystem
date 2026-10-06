package com.schoolapp.feature.health.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.PersonSearch
import androidx.compose.material3.HorizontalDivider
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.health.R

/** Search box plus results, as items of a screen's lazy column. [hint] shows before the user types. */
internal fun LazyListScope.studentSearchItems(
    state: StudentSearchState,
    onQueryChange: (String) -> Unit,
    onPick: (StudentSummary) -> Unit,
    hint: String?,
) {
    item(key = "search") {
        SearchField(
            value = state.query,
            onValueChange = onQueryChange,
            placeholder = stringResource(R.string.health_search_students),
        )
    }
    when {
        state.searching -> item(key = "searching") { LoadingState() }
        state.error != null -> item(key = "search_error") { InlineMessage(appErrorMessage(state.error), StatusTone.Error) }
        state.searched && state.results.isEmpty() -> item(key = "search_empty") {
            EmptyState(stringResource(R.string.health_search_empty), icon = Icons.Outlined.PersonSearch)
        }
        state.results.isNotEmpty() -> item(key = "results") {
            AppCard(contentPadding = 0.dp) {
                state.results.forEachIndexed { index, student ->
                    Column {
                        StudentResultRow(student, onClick = { onPick(student) })
                        if (index < state.results.lastIndex) HorizontalDivider(color = AppColors.Border)
                    }
                }
            }
        }
        hint != null -> item(key = "search_hint") { EmptyState(hint, icon = Icons.Outlined.PersonSearch) }
    }
}
