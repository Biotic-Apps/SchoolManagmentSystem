package com.schoolapp.feature.progress.homework.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.progress.R
import com.schoolapp.feature.progress.homework.HomeworkMessage

@Composable
internal fun HomeworkMessageBanner(message: HomeworkMessage, modifier: Modifier = Modifier) {
    when (message) {
        HomeworkMessage.Saved -> InlineMessage(stringResource(R.string.progress_ticks_saved), StatusTone.Success, modifier)
        HomeworkMessage.NeedTick -> InlineMessage(stringResource(R.string.progress_ticks_required), StatusTone.Warning, modifier)
        is HomeworkMessage.Failed -> InlineMessage(
            stringResource(R.string.progress_ticks_failed, appErrorMessage(message.error)),
            StatusTone.Error,
            modifier,
        )
    }
}
