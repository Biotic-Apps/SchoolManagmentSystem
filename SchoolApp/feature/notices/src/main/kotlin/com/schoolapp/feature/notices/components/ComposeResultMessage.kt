package com.schoolapp.feature.notices.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.notices.NoticeComposeResult
import com.schoolapp.feature.notices.R

@Composable
internal fun ComposeResultMessage(result: NoticeComposeResult) {
    when (result) {
        NoticeComposeResult.PUBLISHED -> InlineMessage(stringResource(R.string.notices_result_published), StatusTone.Success)
        NoticeComposeResult.SENT_FOR_APPROVAL -> InlineMessage(stringResource(R.string.notices_result_sent_for_approval), StatusTone.Warning)
        NoticeComposeResult.DRAFT_SAVED -> InlineMessage(stringResource(R.string.notices_result_draft_saved), StatusTone.Success)
    }
}
