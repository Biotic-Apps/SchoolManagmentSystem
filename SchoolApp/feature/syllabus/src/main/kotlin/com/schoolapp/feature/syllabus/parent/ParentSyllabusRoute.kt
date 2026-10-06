package com.schoolapp.feature.syllabus.parent

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ChildCare
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ProgressRow
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.model.syllabus.SyllabusPlan
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.syllabus.R
import com.schoolapp.feature.syllabus.components.progressSummary
import com.schoolapp.feature.syllabus.components.tone

@Composable
fun ParentSyllabusRoute(
    onOpenPlan: (SyllabusPlan) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ParentSyllabusViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ParentSyllabusScreen(state, onOpenPlan, viewModel::retry, modifier)
}

@Composable
fun ParentSyllabusScreen(
    state: ParentSyllabusUiState,
    onOpenPlan: (SyllabusPlan) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    when {
        !state.hasChild -> EmptyState(stringResource(R.string.syllabus_no_child), modifier, icon = Icons.Outlined.ChildCare)
        state.isLoading -> LoadingState(modifier)
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        else -> ScreenColumn(modifier) {
            item(key = "progress") {
                AppCard(Modifier.fillMaxWidth(), contentPadding = 0.dp) {
                    SectionHeader(
                        title = stringResource(R.string.syllabus_plan_progress),
                        subtitle = if (state.plans.isEmpty()) stringResource(R.string.syllabus_parent_plans_empty) else null,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
                    )
                    state.plans.forEach { plan ->
                        ProgressRow(
                            title = plan.subjectName ?: plan.id,
                            percent = plan.progress.percent,
                            supporting = progressSummary(plan.progress),
                            tone = plan.progress.tone(),
                            onClick = { onOpenPlan(plan) },
                        )
                    }
                }
            }
            item(key = "books") { BookListCard(state.bookList) }
        }
    }
}
