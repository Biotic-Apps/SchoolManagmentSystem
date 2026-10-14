package com.schoolapp.feature.exams.overview

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.admin.ExamDetail
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.examTypeLabel
import com.schoolapp.feature.exams.overview.components.WorkflowCard

/** Exam facts plus the "Next step" workflow card; [onEdit] null hides the edit button. */
@Composable
internal fun ExamOverviewTab(
    exam: ExamDetail,
    isRefreshing: Boolean,
    onRefresh: () -> Unit,
    onExamChanged: (ExamDetail) -> Unit,
    onEdit: (() -> Unit)?,
    modifier: Modifier = Modifier,
    viewModel: ExamWorkflowViewModel = hiltViewModel(key = "exam_workflow_${exam.id}"),
) {
    val workflow by viewModel.state.collectAsStateWithLifecycle()
    RefreshBox(isRefreshing, onRefresh, modifier) {
        ScreenColumn {
            item(key = "workflow") {
                WorkflowCard(exam, workflow) { action -> viewModel.request(action, exam, onExamChanged) }
            }
            item(key = "info") { ExamInfoCard(exam, onEdit) }
        }
    }
    workflow.confirm?.let { action ->
        val publish = action == WorkflowAction.PUBLISH
        ConfirmDialog(
            title = stringResource(if (publish) R.string.exams_publish_title else R.string.exams_close_marks_title),
            message = stringResource(if (publish) R.string.exams_publish_message else R.string.exams_close_marks_message),
            confirmLabel = stringResource(if (publish) R.string.exams_publish else R.string.exams_close_marks),
            onConfirm = { viewModel.run(action, exam, onExamChanged) },
            onDismiss = viewModel::dismissConfirm,
        )
    }
}

@Composable
private fun ExamInfoCard(exam: ExamDetail, onEdit: (() -> Unit)?) {
    AppCard(verticalSpacing = 4.dp) {
        Text(exam.name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
        KeyValueRow(stringResource(R.string.exams_info_type), exam.type?.let { examTypeLabel(it) })
        KeyValueRow(stringResource(R.string.exams_info_scheme), exam.gradingScheme?.name?.takeIf { it.isNotBlank() })
        exam.weightPercent?.let { KeyValueRow(stringResource(R.string.exams_info_weight), stringResource(R.string.exams_info_weight_value, it)) }
        KeyValueRow(stringResource(R.string.exams_info_classes), exam.classes.map { it.name }.filter { it.isNotBlank() }.joinToString(", ").ifEmpty { null })
        KeyValueRow(stringResource(R.string.exams_info_papers), exam.papers.size.toString())
        exam.computedAt?.let { KeyValueRow(stringResource(R.string.exams_info_computed), formatTimestamp(it)) }
        exam.publishedAt?.let { KeyValueRow(stringResource(R.string.exams_info_published), formatDate(it) ?: formatTimestamp(it)) }
        if (onEdit != null) {
            SecondaryButton(
                text = stringResource(R.string.exams_edit_exam),
                onClick = onEdit,
                leadingIcon = Icons.Outlined.Edit,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}
