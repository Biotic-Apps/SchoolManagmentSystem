package com.schoolapp.feature.organisation.classes.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.WarningAmber
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.organisation.ClassIssue
import com.schoolapp.core.model.organisation.ClassOverview
import com.schoolapp.core.model.organisation.SectionOverview
import com.schoolapp.core.model.timetable.TimetableState
import com.schoolapp.feature.organisation.R

/** "A · Science · Ms Sana"; a section without a class teacher says so in the warning colour. */
@Composable
internal fun SectionChip(section: SectionOverview) {
    val teacher = section.classTeacherName
    val text = listOfNotNull(section.name, section.group, teacher ?: stringResource(R.string.org_class_no_teacher)).joinToString(" · ")
    Surface(
        shape = MaterialTheme.shapes.small,
        color = if (teacher == null) AppColors.Background else AppColors.Selected,
        border = BorderStroke(1.dp, AppColors.Border),
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelMedium,
            color = if (teacher == null) AppColors.TextSecondary else AppColors.Primary,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
        )
    }
}

/** Issue chips from the server; "subjects without a teacher" carries the count. */
@Composable
internal fun IssueChips(item: ClassOverview) {
    if (item.issues.isEmpty()) return
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        item.issues.forEach { issue ->
            val text = when (issue) {
                ClassIssue.NO_SECTIONS -> stringResource(R.string.org_issue_no_sections)
                ClassIssue.NO_SUBJECTS -> stringResource(R.string.org_issue_no_subjects)
                ClassIssue.NO_CLASS_TEACHER -> stringResource(R.string.org_issue_no_class_teacher)
                ClassIssue.NO_TIMETABLE -> stringResource(R.string.org_issue_no_timetable)
                ClassIssue.SUBJECTS_WITHOUT_TEACHER -> {
                    val count = item.unallocated.coerceAtLeast(1)
                    pluralStringResource(R.plurals.org_issue_unallocated, count, count)
                }
            }
            StatusChip(text, StatusTone.Warning, icon = Icons.Outlined.WarningAmber)
        }
    }
}

/** "A published, B draft"; null when the server sent no timetable state (older API). */
@Composable
internal fun timetableSummary(item: ClassOverview): String? {
    val known = item.sections.filter { it.timetable != null }
    if (known.isEmpty()) return null
    return known.map { section ->
        val res = when (section.timetable) {
            TimetableState.PUBLISHED -> R.string.org_tt_published
            TimetableState.PUBLISHED_WITH_CHANGES -> R.string.org_tt_changes
            TimetableState.DRAFT -> R.string.org_tt_draft
            else -> R.string.org_tt_empty
        }
        stringResource(res, section.name)
    }.joinToString(", ")
}
