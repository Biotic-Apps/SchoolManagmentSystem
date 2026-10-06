package com.schoolapp.feature.diary.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.diary.R

@Composable
internal fun diaryStatusLabel(status: DiaryStatus): String = stringResource(
    when (status) {
        DiaryStatus.DRAFT -> R.string.diary_status_draft
        DiaryStatus.SUBMITTED -> R.string.diary_status_submitted
        DiaryStatus.PUBLISHED -> R.string.diary_status_published
        DiaryStatus.RETURNED -> R.string.diary_status_returned
        DiaryStatus.PENDING_REVIEW -> R.string.diary_status_pending_review
    },
)

internal fun DiaryStatus.tone(): StatusTone = if (this == DiaryStatus.RETURNED) StatusTone.Error else statusTone(name)
