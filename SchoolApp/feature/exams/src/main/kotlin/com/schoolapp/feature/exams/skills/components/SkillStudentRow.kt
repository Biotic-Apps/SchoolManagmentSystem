package com.schoolapp.feature.exams.skills.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ProgressRow
import com.schoolapp.core.designsystem.component.StatusTone
import androidx.compose.ui.unit.dp
import com.schoolapp.core.model.exams.SkillStudent
import com.schoolapp.feature.exams.R

/** A student in the list: roll no, name and how many items are rated. */
@Composable
internal fun SkillStudentRow(student: SkillStudent, rated: Int, total: Int, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val roll = student.rollNo?.let { stringResource(R.string.exams_skills_roll, it) }
    AppCard(modifier = modifier, onClick = onClick, contentPadding = 0.dp) {
        ProgressRow(
            title = listOfNotNull(roll, student.name).joinToString("  ·  "),
            supporting = stringResource(R.string.exams_skills_rated_of, rated, total),
            percent = if (total == 0) 0 else rated * 100 / total,
            tone = if (total > 0 && rated >= total) StatusTone.Success else StatusTone.Warning,
        )
    }
}
