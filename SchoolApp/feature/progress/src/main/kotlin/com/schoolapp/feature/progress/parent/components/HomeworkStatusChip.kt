package com.schoolapp.feature.progress.parent.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.progress.HomeworkStatus
import com.schoolapp.feature.progress.R
import com.schoolapp.feature.progress.components.homeworkStatusLabel

/** Teacher's tick on one homework; null reads "Not checked yet". */
@Composable
internal fun HomeworkStatusChip(status: HomeworkStatus?, modifier: Modifier = Modifier) {
    val text = status?.let { homeworkStatusLabel(it) } ?: stringResource(R.string.progress_status_unchecked)
    StatusChip(text, status.tone(), modifier)
}

private fun HomeworkStatus?.tone(): StatusTone = when (this) {
    HomeworkStatus.DONE -> StatusTone.Success
    HomeworkStatus.PARTIAL -> StatusTone.Warning
    HomeworkStatus.NOT_DONE -> StatusTone.Error
    null -> StatusTone.Neutral
}
