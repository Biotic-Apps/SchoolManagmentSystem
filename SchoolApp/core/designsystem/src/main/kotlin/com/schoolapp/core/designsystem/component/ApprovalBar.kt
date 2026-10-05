package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors

enum class ApprovalAction { Approve, Reject, Return }

/** Bottom action bar for approval decisions. [busyAction] shows a spinner on that button. */
@Composable
fun ApprovalBar(
    onApprove: () -> Unit,
    onReject: () -> Unit,
    modifier: Modifier = Modifier,
    onReturn: (() -> Unit)? = null,
    busyAction: ApprovalAction? = null,
    enabled: Boolean = true,
) {
    val busy = busyAction != null
    Surface(modifier = modifier.fillMaxWidth(), color = AppColors.Surface) {
        Column {
            HorizontalDivider(color = AppColors.Border)
            Row(
                modifier = Modifier.navigationBarsPadding().padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                if (onReturn != null) {
                    AppTextButton(
                        text = stringResource(R.string.ds_return),
                        onClick = onReturn,
                        enabled = enabled && !busy,
                        loading = busyAction == ApprovalAction.Return,
                    )
                }
                SecondaryButton(
                    text = stringResource(R.string.ds_reject),
                    onClick = onReject,
                    enabled = enabled && !busy,
                    loading = busyAction == ApprovalAction.Reject,
                    contentColor = AppColors.Error,
                    modifier = Modifier.weight(1f),
                )
                PrimaryButton(
                    text = stringResource(R.string.ds_approve),
                    onClick = onApprove,
                    enabled = enabled && !busy,
                    loading = busyAction == ApprovalAction.Approve,
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}

@Preview
@Composable
private fun ApprovalBarPreview() = PreviewContainer {
    ApprovalBar(onApprove = {}, onReject = {}, onReturn = {})
}
