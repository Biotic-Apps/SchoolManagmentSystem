package com.schoolapp.feature.students.sections

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.PersonSearch
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.material.icons.outlined.PersonAdd
import com.schoolapp.core.designsystem.component.PrimaryButton
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.DataList
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.components.CenteredColumn
import com.schoolapp.feature.students.components.StudentRow
import com.schoolapp.feature.students.components.sectionLabel

@Composable
fun MyClassesScreen(
    state: MyClassesUiState,
    onQueryChange: (String) -> Unit,
    onOpenSection: (Section) -> Unit,
    onOpenStudent: (String) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
    onAddStudent: () -> Unit = {},
) {
    CenteredColumn(modifier) {
        if (state.canAdd) {
            PrimaryButton(
                stringResource(R.string.students_add_title),
                onClick = onAddStudent,
                leadingIcon = Icons.Outlined.PersonAdd,
                modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 16.dp),
            )
        }
        if (state.canSearch) {
            StudentSearchBar(query = state.query, onQueryChange = onQueryChange, modifier = Modifier.padding(16.dp))
        }
        val listModifier = Modifier.padding(horizontal = 16.dp).padding(bottom = 16.dp)
            .padding(top = if (state.canSearch) 0.dp else 16.dp)
        when {
            state.showsSearch -> when {
                state.isSearching -> LoadingState()
                state.searchError != null -> ErrorState(appErrorMessage(state.searchError))
                else -> DataList(
                    items = state.results,
                    key = { it.id },
                    modifier = listModifier,
                    emptyContent = { EmptyState(stringResource(R.string.students_search_empty), icon = Icons.Outlined.PersonSearch) },
                ) { StudentRow(it, onClick = { onOpenStudent(it.id) }, showClass = true) }
            }
            state.isLoading -> LoadingState()
            state.error != null -> ErrorState(appErrorMessage(state.error), onRetry = onRetry)
            else -> DataList(
                items = state.sections,
                key = { it.id },
                modifier = listModifier,
                emptyContent = { EmptyState(stringResource(R.string.students_sections_empty), icon = Icons.Outlined.Groups) },
            ) { section ->
                ListItemRow(
                    title = sectionLabel(section.className, section.name) ?: section.name,
                    supporting = listOfNotNull(
                        pluralStringResource(R.plurals.students_count, section.studentCount, section.studentCount),
                        section.roomName,
                    ).joinToString(" · "),
                    leadingIcon = Icons.Outlined.Groups,
                    onClick = { onOpenSection(section) },
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun MyClassesScreenPreview() = SchoolTheme {
    MyClassesScreen(
        state = MyClassesUiState(
            isLoading = false,
            canSearch = true,
            sections = listOf(Section("1", "c5", "Class 5", "A", 35, "Room 12", 32, "ACTIVE")),
        ),
        onQueryChange = {}, onOpenSection = {}, onOpenStudent = {}, onRetry = {},
    )
}
