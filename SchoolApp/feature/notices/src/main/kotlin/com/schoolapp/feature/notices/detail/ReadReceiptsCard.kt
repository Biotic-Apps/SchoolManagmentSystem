package com.schoolapp.feature.notices.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ProgressRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.notice.NoticeReads
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.notices.R

/** "120 of 300 recipients have read it" with a read-rate bar (green from 75 %, amber from 40 %). */
@Composable
internal fun ReadReceiptsCard(reads: NoticeReads?, loading: Boolean, error: AppError?, onRetry: () -> Unit) {
    AppCard {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SectionHeader(
                title = stringResource(R.string.notices_reads_title),
                action = { AppTextButton(stringResource(R.string.notices_reads_refresh), onClick = onRetry, enabled = !loading) },
            )
            when {
                loading && reads == null -> LoadingState()
                error != null -> InlineMessage(appErrorMessage(error), StatusTone.Error)
                reads != null -> {
                    Text(
                        stringResource(R.string.notices_reads_summary, reads.read, reads.total),
                        style = MaterialTheme.typography.bodyLarge,
                        color = AppColors.TextPrimary,
                    )
                    ProgressRow(
                        title = stringResource(R.string.notices_reads_read),
                        percent = reads.percent,
                        supporting = stringResource(R.string.notices_reads_unread, reads.unread),
                        tone = when {
                            reads.percent >= 75 -> StatusTone.Success
                            reads.percent >= 40 -> StatusTone.Warning
                            else -> StatusTone.Error
                        },
                    )
                }
            }
        }
    }
}
