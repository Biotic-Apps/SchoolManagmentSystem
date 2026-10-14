package com.schoolapp.feature.staff.assignments

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.RemoveCircleOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.staff.StaffAssignment
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.staff.R

/** One assignment; [onEnd] is null when the viewer may not end it. */
@Composable
internal fun AssignmentRow(assignment: StaffAssignment, onEnd: (() -> Unit)?, modifier: Modifier = Modifier) {
    val a = assignment
    val where = listOfNotNull(a.className, a.sectionName).joinToString(" - ").ifBlank { null }
        ?: stringResource(R.string.staff_asg_whole_branch)
    val extra = listOfNotNull(
        a.subjectName,
        a.responsibleStaffName?.let { stringResource(R.string.staff_responsible, it) },
        a.validUntil?.let { stringResource(R.string.staff_substitute_until, formatDate(it).orEmpty()) }
            ?: stringResource(R.string.staff_asg_substitute).takeIf { a.isSubstitute },
    )
    AppCard(modifier.fillMaxWidth(), contentPadding = 0.dp) {
        ListItemRow(
            title = humanizeKey(a.kind),
            supporting = (listOf(where) + extra).joinToString(" · "),
            leadingIcon = Icons.Outlined.Groups,
            trailing = onEnd?.let { end ->
                {
                    IconButton(onClick = end) {
                        Icon(Icons.Outlined.RemoveCircleOutline, stringResource(R.string.staff_asg_end), tint = AppColors.Error)
                    }
                }
            },
        )
    }
}
