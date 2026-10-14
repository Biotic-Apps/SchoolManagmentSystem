package com.schoolapp.feature.students.guardiandetail

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.LinkOff
import androidx.compose.material.icons.outlined.School
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.guardians.GuardianChild
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.components.sectionLabel

/** Children linked to this guardian; a row opens the student, the unlink button revokes the link. */
@Composable
internal fun GuardianChildrenCard(
    children: List<GuardianChild>,
    canUnlink: Boolean,
    onOpenStudent: (String) -> Unit,
    onUnlink: (GuardianChild) -> Unit,
) {
    AppCard(Modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        SectionHeader(title = stringResource(R.string.students_children))
        if (children.isEmpty()) {
            InlineMessage(stringResource(R.string.students_no_children), StatusTone.Info)
            return@AppCard
        }
        Column {
            children.forEachIndexed { index, child ->
                if (index > 0) HorizontalDivider(color = AppColors.Border)
                ListItemRow(
                    title = child.name,
                    supporting = listOfNotNull(
                        child.relation?.let(::humanizeKey),
                        sectionLabel(child.className, child.sectionName),
                        child.admissionNo,
                    ).joinToString(" · "),
                    leadingIcon = Icons.Outlined.School,
                    onClick = { onOpenStudent(child.studentId) },
                    trailing = {
                        androidx.compose.foundation.layout.Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                            child.status?.let { StatusChip(humanizeKey(it), linkTone(it)) }
                            if (canUnlink && child.isActiveLink) {
                                IconButton(onClick = { onUnlink(child) }) {
                                    Icon(Icons.Outlined.LinkOff, contentDescription = stringResource(R.string.students_unlink), tint = AppColors.Error)
                                }
                            }
                        }
                    },
                )
            }
        }
    }
}

private fun linkTone(status: String) = when (status) {
    "VERIFIED" -> StatusTone.Success
    "REQUESTED" -> StatusTone.Warning
    "REJECTED", "REVOKED" -> StatusTone.Error
    else -> StatusTone.Neutral
}
