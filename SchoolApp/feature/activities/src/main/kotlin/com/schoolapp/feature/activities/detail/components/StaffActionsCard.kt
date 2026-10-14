package com.schoolapp.feature.activities.detail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Block
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.PlayArrow
import androidx.compose.material.icons.outlined.TaskAlt
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.detail.LifecycleActions

/** Edit (PROPOSED), Mark ongoing, Mark completed and Cancel, as the role and status allow. */
@Composable
internal fun StaffActionsCard(
    actions: LifecycleActions,
    onEdit: () -> Unit,
    onStart: () -> Unit,
    onComplete: () -> Unit,
    onCancel: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val busy = actions.busyStatus != null
    AppCard(modifier) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SectionHeader(stringResource(R.string.activities_actions))
            if (actions.canStart) {
                PrimaryButton(
                    stringResource(R.string.activities_mark_ongoing),
                    onStart,
                    Modifier.fillMaxWidth(),
                    enabled = !busy,
                    loading = actions.busyStatus == ActivityStatus.ONGOING,
                    leadingIcon = Icons.Outlined.PlayArrow,
                )
            }
            if (actions.canComplete) {
                PrimaryButton(
                    stringResource(R.string.activities_mark_completed),
                    onComplete,
                    Modifier.fillMaxWidth(),
                    enabled = !busy,
                    loading = actions.busyStatus == ActivityStatus.COMPLETED,
                    leadingIcon = Icons.Outlined.TaskAlt,
                )
            }
            if (actions.canEdit) {
                SecondaryButton(stringResource(R.string.activities_edit), onEdit, Modifier.fillMaxWidth(), enabled = !busy, leadingIcon = Icons.Outlined.Edit)
            }
            if (actions.canCancel) {
                SecondaryButton(
                    stringResource(R.string.activities_cancel_activity),
                    onCancel,
                    Modifier.fillMaxWidth(),
                    enabled = !busy,
                    leadingIcon = Icons.Outlined.Block,
                    contentColor = AppColors.Error,
                )
            }
        }
    }
}

