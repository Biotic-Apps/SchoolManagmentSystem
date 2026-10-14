package com.schoolapp.feature.organisation.classes.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.SwapVert
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.feature.organisation.R

/** "Reorder" above the cards ("Add class" is the floating button); shown only when the role may reorder. */
@Composable
internal fun ClassesToolbar(onReorder: () -> Unit, modifier: Modifier = Modifier) {
    Row(modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End)) {
        SecondaryButton(stringResource(R.string.org_reorder), onClick = onReorder, leadingIcon = Icons.Outlined.SwapVert)
    }
}
