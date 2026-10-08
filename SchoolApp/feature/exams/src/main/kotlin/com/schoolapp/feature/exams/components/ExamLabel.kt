package com.schoolapp.feature.exams.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.feature.exams.R

/** "Mid-term 2026 · Term 1", or just the exam name when its term is unknown. */
@Composable
internal fun examLabel(exam: Exam): String {
    val term = exam.termName?.takeIf { it.isNotBlank() } ?: return exam.name
    return stringResource(R.string.exams_exam_with_term, exam.name, term)
}

/** Exam picker chips labelled with the term. */
@Composable
internal fun examOptions(exams: List<Exam>): List<SwitcherOption> = exams.map { SwitcherOption(it.id, examLabel(it)) }
