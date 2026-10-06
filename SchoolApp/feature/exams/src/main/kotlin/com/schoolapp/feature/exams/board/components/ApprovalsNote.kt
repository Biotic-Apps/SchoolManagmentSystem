package com.schoolapp.feature.exams.board.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.exams.R

/** Result approval and publishing are not done here; links to Approvals when the role has it. */
@Composable
internal fun ApprovalsNote(onOpenApprovals: (() -> Unit)?, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        InlineMessage(stringResource(R.string.exams_approvals_note), StatusTone.Info)
        if (onOpenApprovals != null) AppTextButton(stringResource(R.string.exams_open_approvals), onOpenApprovals)
    }
}
