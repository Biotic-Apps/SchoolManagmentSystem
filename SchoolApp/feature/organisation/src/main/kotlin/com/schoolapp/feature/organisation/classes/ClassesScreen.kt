package com.schoolapp.feature.organisation.classes

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.outlined.Layers
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
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
import com.schoolapp.core.model.organisation.ClassIssue
import com.schoolapp.core.model.organisation.ClassOverview
import com.schoolapp.core.model.organisation.ClassSubjectRef
import com.schoolapp.core.model.organisation.SectionOverview
import com.schoolapp.core.model.timetable.TimetableState
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.classes.components.ClassOverviewCard
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
            titles = listOf(stringResource(R.string.org_tab_classes), stringResource(R.string.org_tab_subjects)),
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
    when (state.tab) {
        ClassesTab.CLASSES -> if (state.classes.isEmpty()) {
            PullableState { EmptyState(stringResource(R.string.org_classes_empty), message = state.sessionName, icon = Icons.Outlined.Layers) }
        } else {
            // One column on phones, two or three on tablets and wide windows.
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 300.dp),
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize(),
            ) {
                items(state.classes, key = { it.id }) { ClassOverviewCard(it) }
            }
        }
        ClassesTab.SUBJECTS -> DataList(
            items = state.subjects,
            key = { it.id },
            modifier = Modifier.padding(horizontal = 16.dp).padding(bottom = 16.dp),
            emptyContent = { PullableState { EmptyState(stringResource(R.string.org_subjects_empty)) } },
        ) { item ->
            ListItemRow(title = item.name, supporting = item.code, leadingIcon = Icons.AutoMirrored.Outlined.MenuBook)
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun ClassesScreenPreview() = SchoolTheme {
    ClassesScreen(
        state = ClassesUiState(
            isLoading = false,
            branches = listOf(BranchOption("b1", "Main Branch", "s1")),
            selectedBranchId = "b1",
            classes = listOf(
                ClassOverview(
                    id = "c9", name = "Class 9", levelOrder = 12, status = "ACTIVE", studentCount = 58, capacity = 80,
                    sections = listOf(
                        SectionOverview("a", "A", "Science", 30, 40, "R-12", "Ms Sana", TimetableState.PUBLISHED),
                        SectionOverview("b", "B", "Arts", 28, 40, null, null, TimetableState.DRAFT),
                    ),
                    subjects = listOf(ClassSubjectRef("e", "English", 6, null), ClassSubjectRef("p", "Physics", 6, "Science")),
                    issues = listOf(ClassIssue.NO_CLASS_TEACHER, ClassIssue.SUBJECTS_WITHOUT_TEACHER),
                    unallocated = 3,
                ),
            ),
        ),
        onTabSelected = {}, onBranchSelected = {}, onRetry = {}, onRefresh = {},
    )
}
