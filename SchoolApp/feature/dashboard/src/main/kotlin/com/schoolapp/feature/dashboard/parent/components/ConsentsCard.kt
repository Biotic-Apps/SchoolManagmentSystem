package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.HowToReg
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.feature.dashboard.R

/** Activity consents waiting for the parent; opens the activities list. Shown only while some are pending. */
@Composable
internal fun ConsentsCard(pending: Int, onOpen: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), contentPadding = 0.dp) {
        ListItemRow(
            title = stringResource(R.string.dashboard_consents_title),
            supporting = pluralStringResource(R.plurals.dashboard_consents_pending, pending, pending),
            leadingIcon = Icons.Outlined.HowToReg,
            onClick = onOpen,
            trailing = { StatusChip(pending.toString(), StatusTone.Warning) },
        )
    }
}
