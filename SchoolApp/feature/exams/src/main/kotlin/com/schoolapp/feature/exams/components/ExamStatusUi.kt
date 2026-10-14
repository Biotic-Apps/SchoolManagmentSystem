package com.schoolapp.feature.exams.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.ExamType
import com.schoolapp.feature.exams.R

@Composable
@ReadOnlyComposable
internal fun examTypeLabel(type: ExamType): String = stringResource(
    when (type) {
        ExamType.TERM -> R.string.exams_type_term
        ExamType.MIDTERM -> R.string.exams_type_midterm
        ExamType.UNIT_TEST -> R.string.exams_type_unit_test
        ExamType.FINAL -> R.string.exams_type_final
    },
)

@Composable
@ReadOnlyComposable
internal fun examStatusLabel(status: ExamStatus): String = stringResource(
    when (status) {
        ExamStatus.DRAFT -> R.string.exams_exam_status_draft
        ExamStatus.SCHEDULED -> R.string.exams_exam_status_scheduled
        ExamStatus.MARKS_OPEN -> R.string.exams_exam_status_marks_open
        ExamStatus.MARKS_CLOSED -> R.string.exams_exam_status_marks_closed
        ExamStatus.RESULTS_APPROVED -> R.string.exams_exam_status_results_approved
        ExamStatus.PUBLISHED -> R.string.exams_exam_status_published
    },
)

internal fun ExamStatus.tone(): StatusTone = when (this) {
    ExamStatus.DRAFT -> StatusTone.Neutral
    ExamStatus.SCHEDULED, ExamStatus.MARKS_OPEN -> StatusTone.Info
    ExamStatus.MARKS_CLOSED -> StatusTone.Warning
    ExamStatus.RESULTS_APPROVED, ExamStatus.PUBLISHED -> StatusTone.Success
}
