package com.schoolapp.feature.progress.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.progress.ProgressNote
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.progress.R

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun NoteCard(note: ProgressNote, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier) {
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
            itemVerticalAlignment = Alignment.CenterVertically,
        ) {
            StatusChip(categoryLabel(note.category), note.category.tone())
            if (note.visibleToParent) {
                StatusChip(stringResource(R.string.progress_visible_to_parent), StatusTone.Info, icon = Icons.Outlined.Visibility)
            } else {
                StatusChip(stringResource(R.string.progress_staff_only), StatusTone.Neutral, icon = Icons.Outlined.Lock)
            }
        }
        Text(
            note.note,
            style = MaterialTheme.typography.bodyLarge,
            color = AppColors.TextPrimary,
            modifier = Modifier.padding(top = 8.dp),
        )
        val meta = listOfNotNull(
            note.author?.name?.let { stringResource(R.string.progress_by_author, it) },
            formatTimestamp(note.createdAt),
        ).joinToString(" · ")
        if (meta.isNotEmpty()) {
            Text(meta, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary, modifier = Modifier.padding(top = 4.dp))
        }
    }
}
