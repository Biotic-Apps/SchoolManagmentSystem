package com.schoolapp.feature.students.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.students.R

@Composable
internal fun StudentRow(
    student: StudentSummary,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    showClass: Boolean = false,
) {
    val roll = student.rollNo?.let { stringResource(R.string.students_roll_no, it) }
    val classLabel = if (showClass) sectionLabel(student.className, student.sectionName) else null
    ListItemRow(
        title = student.name,
        supporting = listOfNotNull(roll, classLabel, student.admissionNo).joinToString(" · "),
        leading = { PersonAvatar(student.name, student.photoUrl) },
        onClick = onClick,
        modifier = modifier,
        trailing = student.status?.takeIf { it != ACTIVE }?.let { status ->
            { StatusChip(humanizeKey(status), statusTone(status)) }
        },
    )
}

internal fun sectionLabel(className: String?, sectionName: String?): String? =
    listOfNotNull(className, sectionName).joinToString(" - ").ifBlank { null }

private const val ACTIVE = "ACTIVE"
