package com.schoolapp.feature.fees.record.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.SearchField
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.components.classLabel

/** Search by name or admission number and pick one student; the picked student shows with a Change action. */
@Composable
internal fun StudentPicker(
    selected: StudentSummary?,
    search: String,
    results: List<StudentSummary>,
    isSearching: Boolean,
    searchError: AppError?,
    showRequired: Boolean,
    enabled: Boolean,
    onSearchChange: (String) -> Unit,
    onSelect: (StudentSummary) -> Unit,
    onClear: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(stringResource(R.string.fees_student), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        if (selected != null) {
            AppCard(contentPadding = 4.dp) {
                ListItemRow(
                    title = selected.name,
                    supporting = studentLine(selected),
                    leading = { PersonAvatar(selected.name, selected.photoUrl) },
                    trailing = { AppTextButton(stringResource(R.string.fees_change), onClear, enabled = enabled) },
                )
            }
            return@Column
        }
        SearchField(value = search, onValueChange = onSearchChange, placeholder = stringResource(R.string.fees_search_student))
        if (showRequired) Text(stringResource(R.string.fees_student_required), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        searchError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        if (isSearching) LoadingState()
        if (!isSearching && search.trim().length >= 2 && results.isEmpty() && searchError == null) {
            Text(stringResource(R.string.fees_no_students), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        if (results.isNotEmpty()) {
            AppCard(contentPadding = 4.dp) {
                results.forEach { student ->
                    ListItemRow(
                        title = student.name,
                        supporting = studentLine(student),
                        leading = { PersonAvatar(student.name, student.photoUrl) },
                        onClick = { onSelect(student) },
                    )
                }
            }
        }
    }
}

@Composable
private fun studentLine(student: StudentSummary): String = listOfNotNull(
    classLabel(student.className, student.sectionName),
    student.rollNo?.let { stringResource(R.string.fees_roll_no, it) },
    student.admissionNo,
).joinToString(" · ")
