package com.schoolapp.feature.syllabus.plans

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ProgressRow
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.dataListItems
import com.schoolapp.core.model.syllabus.SyllabusPlan
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.syllabus.R
import com.schoolapp.feature.syllabus.components.displayTitle
import com.schoolapp.feature.syllabus.components.progressSummary
import com.schoolapp.feature.syllabus.components.tone

@Composable
fun MyPlansRoute(
    onOpenPlan: (SyllabusPlan) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MyPlansViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    MyPlansScreen(state, onOpenPlan, viewModel::load, modifier)
}

@Composable
fun MyPlansScreen(
    state: MyPlansUiState,
    onOpenPlan: (SyllabusPlan) -> Unit,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    ScreenColumn(modifier, itemSpacing = 0.dp) {
        when {
            state.isLoading -> item(key = "loading") { LoadingState() }
            state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = onRetry) }
            else -> dataListItems(
                items = state.plans,
                key = { it.id },
                emptyContent = { EmptyState(stringResource(R.string.syllabus_plans_empty), icon = Icons.AutoMirrored.Outlined.MenuBook) },
            ) { plan ->
                ProgressRow(
                    title = plan.displayTitle(),
                    percent = plan.progress.percent,
                    supporting = progressSummary(plan.progress),
                    tone = plan.progress.tone(),
                    onClick = { onOpenPlan(plan) },
                )
            }
        }
    }
}
