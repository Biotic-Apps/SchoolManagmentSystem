package com.schoolapp.feature.meetings.staff.schedule.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.meetings.R

/** Search students in scope (server-filtered) and pick one; once picked shows it with "Change". */
@Composable
internal fun StudentChooser(
    selected: StudentSummary?,
    query: String,
    isSearching: Boolean,
    results: List<StudentSummary>,
    error: AppError?,
    missing: Boolean,
    enabled: Boolean,
    onQueryChange: (String) -> Unit,
    onSelect: (StudentSummary) -> Unit,
    onClear: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(stringResource(R.string.meetings_student))
        if (selected != null) {
            AppCard(contentPadding = 0.dp) {
                StudentLine(selected, trailing = {
                    if (enabled) AppTextButton(stringResource(R.string.meetings_change), onClear)
                })
            }
            return@Column
        }
        SearchField(value = query, onValueChange = onQueryChange, placeholder = stringResource(R.string.meetings_search_student))
        val searchable = query.trim().length >= MIN_QUERY
        when {
            missing -> InlineMessage(stringResource(R.string.meetings_pick_student), StatusTone.Error)
            error != null -> InlineMessage(appErrorMessage(error), StatusTone.Error)
            !searchable -> InlineMessage(stringResource(R.string.meetings_search_hint), StatusTone.Info)
        }
        when {
            isSearching -> LoadingState()
            searchable && results.isEmpty() && error == null ->
                InlineMessage(stringResource(R.string.meetings_no_students), StatusTone.Neutral)
            results.isNotEmpty() -> AppCard(contentPadding = 0.dp) {
                results.forEachIndexed { index, student ->
                    if (index > 0) HorizontalDivider(color = AppColors.Border)
                    StudentLine(student, onClick = { onSelect(student) })
                }
            }
        }
    }
}

internal const val MIN_QUERY = 2
