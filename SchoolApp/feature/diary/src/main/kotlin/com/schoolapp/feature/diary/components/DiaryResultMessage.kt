package com.schoolapp.feature.diary.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.diary.R
import com.schoolapp.feature.diary.editor.DiaryEditResult

@Composable
internal fun DiaryResultMessage(result: DiaryEditResult, modifier: Modifier = Modifier) {
    val (text, tone) = when (result) {
        DiaryEditResult.DRAFT_SAVED -> R.string.diary_result_draft_saved to StatusTone.Success
        DiaryEditResult.PUBLISHED -> R.string.diary_result_published to StatusTone.Success
        DiaryEditResult.PENDING_REVIEW -> R.string.diary_result_pending_review to StatusTone.Warning
        DiaryEditResult.QUEUED -> R.string.diary_result_queued to StatusTone.Info
    }
    InlineMessage(stringResource(text), tone, modifier)
}
