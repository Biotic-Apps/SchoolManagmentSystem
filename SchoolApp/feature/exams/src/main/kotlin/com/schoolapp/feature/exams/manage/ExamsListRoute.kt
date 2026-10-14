package com.schoolapp.feature.exams.manage

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Grading
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.examStatusLabel
import com.schoolapp.feature.exams.components.examTypeLabel
import com.schoolapp.feature.exams.components.tone
import com.schoolapp.feature.exams.manage.form.ExamFormSheet

/** All exams of the branch; a card opens the exam ([onOpenExam]); "New exam" creates one and opens it. */
@Composable
internal fun ExamsListRoute(
    onOpenExam: (examId: String, name: String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ExamsListViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleResumeEffect(viewModel) {
        viewModel.onResume()
        onPauseOrDispose { }
    }
    Box(modifier.fillMaxSize()) {
        when {
            state.isLoading -> LoadingState()
            state.error != null -> ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), onRetry = viewModel::retry)
            else -> ExamsList(state, viewModel::onFilterSelected, viewModel::refresh) { onOpenExam(it.id, it.name) }
        }
        if (state.canCreate) {
            Box(Modifier.align(Alignment.BottomEnd).padding(16.dp)) {
                AppFloatingButton(stringResource(R.string.exams_new_exam), Icons.Outlined.Add, viewModel::openForm)
            }
        }
    }
    if (state.formOpen) {
        ExamFormSheet(exam = null, onDismiss = viewModel::closeForm, onSaved = { exam ->
            viewModel.closeForm()
            onOpenExam(exam.id, exam.name)
        })
    }
}

@Composable
private fun ExamsList(state: ExamsListUiState, onFilter: (String) -> Unit, onRefresh: () -> Unit, onOpen: (Exam) -> Unit) {
    val filters = listOf(SwitcherOption(ALL, stringResource(R.string.exams_list_all))) +
        ExamStatus.entries.filter { status -> state.exams.any { it.status == status } }
            .map { SwitcherOption(it.name, examStatusLabel(it)) }
    RefreshBox(state.isRefreshing, onRefresh) {
        ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 88.dp)) {
            if (state.exams.isEmpty()) {
                item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.exams_list_empty),
                        message = stringResource(R.string.exams_list_empty_message),
                        icon = Icons.Outlined.Grading,
                    )
                }
                return@ScreenColumn
            }
            item(key = "filters") { FilterChipRow(filters, state.filter?.name ?: ALL, onFilter) }
            val visible = state.visible
            if (visible.isEmpty()) item(key = "filtered_empty") { EmptyState(stringResource(R.string.exams_list_filtered_empty)) }
            items(visible, key = { it.id }) { exam -> ExamListCard(exam) { onOpen(exam) } }
        }
    }
}

@Composable
private fun ExamListCard(exam: Exam, onClick: () -> Unit) {
    AppCard(onClick = onClick) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.Top) {
            Text(exam.name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
            StatusChip(examStatusLabel(exam.status), exam.status.tone())
        }
        val caption = listOfNotNull(exam.type?.let { examTypeLabel(it) }, exam.termName).joinToString(" · ")
        if (caption.isNotEmpty()) {
            Text(caption, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary, modifier = Modifier.padding(top = 4.dp))
        }
    }
}

private const val ALL = "ALL"
