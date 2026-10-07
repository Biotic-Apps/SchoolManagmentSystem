package com.schoolapp.feature.complaints.detail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Comment
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.PersonAddAlt
import androidx.compose.material.icons.outlined.Replay
import androidx.compose.material.icons.automirrored.outlined.TrendingUp
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.feature.complaints.R
import com.schoolapp.feature.complaints.detail.ComplaintDetailUi
import com.schoolapp.feature.complaints.detail.ReasonAction

/** Buttons the viewer may use; they wrap onto more lines on narrow screens. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun ComplaintActions(
    detail: ComplaintDetailUi,
    onAddUpdate: () -> Unit,
    onReasonAction: (ReasonAction) -> Unit,
    onAssign: () -> Unit,
    modifier: Modifier = Modifier,
) {
    FlowRow(modifier, horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (detail.canAddUpdate) {
            PrimaryButton(stringResource(R.string.complaints_add_update), onAddUpdate, leadingIcon = Icons.Outlined.Edit)
        }
        if (detail.canAssign) {
            SecondaryButton(stringResource(R.string.complaints_assign), onAssign, leadingIcon = Icons.Outlined.PersonAddAlt)
        }
        if (detail.canEscalate) {
            SecondaryButton(
                stringResource(R.string.complaints_escalate),
                { onReasonAction(ReasonAction.ESCALATE) },
                leadingIcon = Icons.AutoMirrored.Outlined.TrendingUp,
            )
        }
        if (detail.canClose) {
            PrimaryButton(
                stringResource(R.string.complaints_close),
                { onReasonAction(ReasonAction.CLOSE) },
                leadingIcon = Icons.Outlined.CheckCircle,
            )
        }
        if (detail.canReopen) {
            SecondaryButton(
                stringResource(R.string.complaints_reopen),
                { onReasonAction(ReasonAction.REOPEN) },
                leadingIcon = Icons.Outlined.Replay,
            )
        }
        if (detail.canComment) {
            SecondaryButton(stringResource(R.string.complaints_add_comment), onAddUpdate, leadingIcon = Icons.AutoMirrored.Outlined.Comment)
        }
    }
}
