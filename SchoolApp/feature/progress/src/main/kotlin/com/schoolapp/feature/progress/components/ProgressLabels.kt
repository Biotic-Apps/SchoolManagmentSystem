package com.schoolapp.feature.progress.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.progress.HomeworkStatus
import com.schoolapp.core.model.progress.ProgressCategory
import com.schoolapp.feature.progress.R

@Composable
@ReadOnlyComposable
internal fun categoryLabel(category: ProgressCategory): String = stringResource(
    when (category) {
        ProgressCategory.HOMEWORK -> R.string.progress_category_homework
        ProgressCategory.BEHAVIOUR -> R.string.progress_category_behaviour
        ProgressCategory.LEARNING -> R.string.progress_category_learning
        ProgressCategory.ACHIEVEMENT -> R.string.progress_category_achievement
    },
)

internal fun ProgressCategory.tone(): StatusTone = when (this) {
    ProgressCategory.HOMEWORK -> StatusTone.Info
    ProgressCategory.BEHAVIOUR -> StatusTone.Warning
    ProgressCategory.LEARNING -> StatusTone.Neutral
    ProgressCategory.ACHIEVEMENT -> StatusTone.Success
}

@Composable
@ReadOnlyComposable
internal fun homeworkStatusLabel(status: HomeworkStatus): String = stringResource(
    when (status) {
        HomeworkStatus.DONE -> R.string.progress_status_done
        HomeworkStatus.PARTIAL -> R.string.progress_status_partial
        HomeworkStatus.NOT_DONE -> R.string.progress_status_not_done
    },
)
