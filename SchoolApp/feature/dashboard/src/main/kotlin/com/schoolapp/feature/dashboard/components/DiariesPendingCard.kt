package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.teacher.PendingDiaryRow

/**
 * Diaries still to write today; tapping opens the editor. "All written" only when diaries were due
 * ([hasDiariesDue]); otherwise "No diaries due today".
 */
@Composable
internal fun DiariesPendingCard(
    diaries: List<PendingDiaryRow>,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    hasDiariesDue: Boolean = true,
) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.dashboard_diaries_pending_title))
        if (diaries.isEmpty()) {
            Text(
                stringResource(if (hasDiariesDue) R.string.dashboard_diaries_all_done else R.string.dashboard_diaries_none_due),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
            )
        }
        diaries.forEach { diary ->
            ListItemRow(
                title = diary.subjectName ?: stringResource(R.string.dashboard_diary_general),
                supporting = diary.sectionLabel ?: stringResource(R.string.dashboard_section_unknown),
                leadingIcon = Icons.AutoMirrored.Outlined.MenuBook,
                onClick = { onOpen(diary.destination) },
                trailing = {
                    Icon(Icons.AutoMirrored.Outlined.KeyboardArrowRight, contentDescription = null, tint = AppColors.TextSecondary)
                },
            )
        }
    }
}
