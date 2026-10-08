package com.schoolapp.feature.staff.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Class
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.ManageAccounts
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.feature.staff.R

/** Principal / admin actions on a staff profile; each is null when the role may not do it. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun StaffActionsRow(
    onEdit: (() -> Unit)?,
    onStatus: (() -> Unit)?,
    onAssign: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    FlowRow(modifier, horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        onEdit?.let { SecondaryButton(stringResource(R.string.staff_action_edit), it, leadingIcon = Icons.Outlined.Edit) }
        onStatus?.let { SecondaryButton(stringResource(R.string.staff_action_status), it, leadingIcon = Icons.Outlined.ManageAccounts) }
        onAssign?.let { SecondaryButton(stringResource(R.string.staff_action_assign), it, leadingIcon = Icons.Outlined.Class) }
    }
}
