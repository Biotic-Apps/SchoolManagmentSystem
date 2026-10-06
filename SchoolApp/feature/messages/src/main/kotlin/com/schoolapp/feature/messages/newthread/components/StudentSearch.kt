package com.schoolapp.feature.messages.newthread.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.messages.R

/** Staff: search students in scope (server-filtered) and pick one. */
@Composable
internal fun StudentSearch(
    query: String,
    isSearching: Boolean,
    results: List<StudentSummary>,
    error: AppError?,
    missing: Boolean,
    onQueryChange: (String) -> Unit,
    onSelect: (StudentSummary) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(stringResource(R.string.messages_student))
        SearchField(value = query, onValueChange = onQueryChange, placeholder = stringResource(R.string.messages_search_student))
        when {
            missing -> InlineMessage(stringResource(R.string.messages_pick_student), StatusTone.Error)
            error != null -> InlineMessage(appErrorMessage(error), StatusTone.Error)
            query.trim().length < 2 -> InlineMessage(stringResource(R.string.messages_search_hint), StatusTone.Info)
        }
        when {
            isSearching -> LoadingState()
            query.trim().length >= 2 && results.isEmpty() && error == null ->
                InlineMessage(stringResource(R.string.messages_no_students), StatusTone.Neutral)
            results.isNotEmpty() -> AppCard(contentPadding = 0.dp) {
                results.forEachIndexed { index, student ->
                    if (index > 0) HorizontalDivider(color = AppColors.Border)
                    StudentLine(student, onClick = { onSelect(student) })
                }
            }
        }
    }
}
