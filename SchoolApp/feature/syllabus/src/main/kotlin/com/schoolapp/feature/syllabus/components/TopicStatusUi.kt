package com.schoolapp.feature.syllabus.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.syllabus.PlanProgress
import com.schoolapp.core.model.syllabus.TopicStatus
import com.schoolapp.feature.syllabus.R

@Composable
@ReadOnlyComposable
internal fun topicStatusLabel(status: TopicStatus): String = stringResource(
    when (status) {
        TopicStatus.NOT_STARTED -> R.string.syllabus_status_not_started
        TopicStatus.IN_PROGRESS -> R.string.syllabus_status_in_progress
        TopicStatus.COMPLETED -> R.string.syllabus_status_completed
    },
)

internal fun TopicStatus.tone(): StatusTone = when (this) {
    TopicStatus.NOT_STARTED -> StatusTone.Neutral
    TopicStatus.IN_PROGRESS -> StatusTone.Info
    TopicStatus.COMPLETED -> StatusTone.Success
}

internal fun PlanProgress.tone(): StatusTone = if (delayed > 0) StatusTone.Warning else StatusTone.Success

@Composable
@ReadOnlyComposable
internal fun progressSummary(progress: PlanProgress): String {
    val done = stringResource(R.string.syllabus_topics_progress, progress.completed, progress.total)
    return if (progress.delayed > 0) "$done · ${stringResource(R.string.syllabus_topics_delayed, progress.delayed)}" else done
}
