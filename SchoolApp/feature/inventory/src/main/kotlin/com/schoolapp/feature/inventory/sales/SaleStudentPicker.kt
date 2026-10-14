package com.schoolapp.feature.inventory.sales

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
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
import com.schoolapp.feature.inventory.R

/** Search by name or admission number and pick one student; the picked student shows with "Change". */
@Composable
internal fun SaleStudentPicker(state: SalesUiState, viewModel: SalesViewModel, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(stringResource(R.string.inv_student), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        val selected = state.student
        if (selected != null) {
            AppCard(contentPadding = 4.dp) {
                ListItemRow(
                    title = selected.name,
                    supporting = studentLine(selected),
                    leading = { PersonAvatar(selected.name, selected.photoUrl) },
                    trailing = { AppTextButton(stringResource(R.string.inv_change), viewModel::onClearStudent, enabled = !state.isSaving) },
                )
            }
            return@Column
        }
        SearchField(value = state.search, onValueChange = viewModel::onSearch, placeholder = stringResource(R.string.inv_search_student))
        if (state.studentMissing) {
            Text(stringResource(R.string.inv_err_student), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        }
        state.searchError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        if (state.isSearching) LoadingState(rows = 2)
        if (!state.isSearching && state.search.trim().length >= 2 && state.results.isEmpty() && state.searchError == null) {
            Text(stringResource(R.string.inv_no_students), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        if (state.results.isNotEmpty()) {
            AppCard(contentPadding = 4.dp) {
                state.results.forEach { student ->
                    ListItemRow(
                        title = student.name,
                        supporting = studentLine(student),
                        leading = { PersonAvatar(student.name, student.photoUrl) },
                        onClick = { viewModel.onStudent(student) },
                    )
                }
            }
        }
    }
}

private fun studentLine(student: StudentSummary): String = listOfNotNull(
    listOfNotNull(student.className, student.sectionName).joinToString(" ").takeIf { it.isNotBlank() },
    student.admissionNo,
).joinToString(" · ")
