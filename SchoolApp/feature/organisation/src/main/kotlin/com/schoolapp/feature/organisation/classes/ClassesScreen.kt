package com.schoolapp.feature.organisation.classes

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.Layers
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.DataList
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.core.model.organisation.BranchOption
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.PullableState
import com.schoolapp.feature.organisation.components.RefreshErrorBanner
import com.schoolapp.feature.organisation.scope.BranchScopeBar
import com.schoolapp.feature.organisation.scope.ScopedPane

@Composable
fun ClassesScreen(
    state: ClassesUiState,
    onTabSelected: (ClassesTab) -> Unit,
    onBranchSelected: (String) -> Unit,
    onRetry: () -> Unit,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier,
) {
    ScopedPane(modifier) {
        AppTabs(
            titles = listOf(
                stringResource(R.string.org_tab_sections),
                stringResource(R.string.org_tab_classes),
                stringResource(R.string.org_tab_subjects),
            ),
            selectedIndex = state.tab.ordinal,
            onSelect = { onTabSelected(ClassesTab.entries[it]) },
        )
        BranchScopeBar(state.branches, state.selectedBranchId, onBranchSelected)
        if (state.isLoading) {
            LoadingState()
        } else {
            RefreshBox(state.isRefreshing, onRefresh, Modifier.fillMaxWidth().weight(1f)) {
                if (state.error != null && !state.hasContent) {
                    PullableState { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
                } else {
                    Column(Modifier.fillMaxSize()) {
                        RefreshErrorBanner(state.error, Modifier.padding(horizontal = 16.dp).padding(bottom = 8.dp))
                        ClassesTabContent(state)
                    }
                }
            }
        }
    }
}

@Composable
private fun ClassesTabContent(state: ClassesUiState) {
    val listModifier = Modifier.padding(horizontal = 16.dp).padding(bottom = 16.dp)
    when (state.tab) {
        ClassesTab.SECTIONS -> DataList(
            items = state.sections,
            key = { it.id },
            modifier = listModifier,
            emptyContent = { PullableState { EmptyState(stringResource(R.string.org_sections_empty), message = state.sessionName) } },
        ) { SectionRow(it) }
        ClassesTab.CLASSES -> DataList(
            items = state.classes,
            key = { it.id },
            modifier = listModifier,
            emptyContent = { PullableState { EmptyState(stringResource(R.string.org_classes_empty)) } },
        ) { item ->
            ListItemRow(
                title = item.name,
                supporting = pluralStringResource(R.plurals.org_class_subjects, item.subjectCount, item.subjectCount),
                leadingIcon = Icons.Outlined.Layers,
            )
        }
        ClassesTab.SUBJECTS -> DataList(
            items = state.subjects,
            key = { it.id },
            modifier = listModifier,
            emptyContent = { PullableState { EmptyState(stringResource(R.string.org_subjects_empty)) } },
        ) { item ->
            ListItemRow(title = item.name, supporting = item.code, leadingIcon = Icons.AutoMirrored.Outlined.MenuBook)
        }
    }
}

@Composable
private fun SectionRow(section: Section) {
    val students = pluralStringResource(R.plurals.org_section_students, section.studentCount, section.studentCount)
    val capacity = section.capacity?.let { stringResource(R.string.org_section_capacity, it) }
    ListItemRow(
        title = listOfNotNull(section.className, section.name).joinToString(" - "),
        supporting = listOfNotNull(students, capacity, section.roomName).joinToString(" · "),
        leadingIcon = Icons.Outlined.Groups,
    )
}

@Preview(showBackground = true)
@Composable
private fun ClassesScreenPreview() = SchoolTheme {
    ClassesScreen(
        state = ClassesUiState(
            isLoading = false,
            branches = listOf(BranchOption("b1", "Main Branch", "s1")),
            selectedBranchId = "b1",
            sections = listOf(Section("1", "c5", "Class 5", "A", 35, "Room 12", 0, "ACTIVE")),
        ),
        onTabSelected = {}, onBranchSelected = {}, onRetry = {}, onRefresh = {},
    )
}
