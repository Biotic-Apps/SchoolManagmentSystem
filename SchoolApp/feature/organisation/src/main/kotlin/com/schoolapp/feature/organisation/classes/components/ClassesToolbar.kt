package com.schoolapp.feature.organisation.classes.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.SwapVert
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.feature.organisation.R

/** "Reorder" and "Add class" above the cards; each is null when the role lacks the permission. */
@Composable
internal fun ClassesToolbar(onAdd: (() -> Unit)?, onReorder: (() -> Unit)?, modifier: Modifier = Modifier) {
    Row(modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End)) {
        onReorder?.let { SecondaryButton(stringResource(R.string.org_reorder), onClick = it, leadingIcon = Icons.Outlined.SwapVert) }
        onAdd?.let { PrimaryButton(stringResource(R.string.org_add_class), onClick = it, leadingIcon = Icons.Outlined.Add) }
    }
}
