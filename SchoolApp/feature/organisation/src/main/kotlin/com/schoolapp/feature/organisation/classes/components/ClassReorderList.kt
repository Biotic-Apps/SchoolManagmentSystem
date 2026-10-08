package com.schoolapp.feature.organisation.classes.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.KeyboardArrowDown
import androidx.compose.material.icons.outlined.KeyboardArrowUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.organisation.ClassOverview
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.classes.ReorderActions

/** Reorder mode: up/down per class (the order report cards and promotions follow), saved in one call. */
@Composable
internal fun ClassReorderList(classes: List<ClassOverview>, saving: Boolean, error: ActionError?, actions: ReorderActions) {
    Column(Modifier.fillMaxSize()) {
        Text(
            stringResource(R.string.org_reorder_hint),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
        )
        error?.let { InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error, Modifier.padding(16.dp, 4.dp)) }
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            itemsIndexed(classes, key = { _, item -> item.id }) { index, item ->
                ReorderRow(index, item.name, index > 0, index < classes.lastIndex, actions)
            }
        }
        Row(Modifier.fillMaxWidth().padding(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            SecondaryButton(stringResource(R.string.org_cancel), onClick = actions.onCancel, modifier = Modifier.weight(1f), enabled = !saving)
            PrimaryButton(stringResource(R.string.org_save_order), onClick = actions.onSave, modifier = Modifier.weight(1f), loading = saving)
        }
    }
}

@Composable
private fun ReorderRow(index: Int, name: String, canUp: Boolean, canDown: Boolean, actions: ReorderActions) {
    AppCard(contentPadding = 8.dp) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                "${index + 1}. $name",
                style = MaterialTheme.typography.bodyLarge,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f).padding(start = 8.dp),
            )
            IconButton(onClick = { actions.onMove(index, index - 1) }, enabled = canUp) {
                Icon(Icons.Outlined.KeyboardArrowUp, contentDescription = stringResource(R.string.org_move_up, name))
            }
            IconButton(onClick = { actions.onMove(index, index + 1) }, enabled = canDown) {
                Icon(Icons.Outlined.KeyboardArrowDown, contentDescription = stringResource(R.string.org_move_down, name))
            }
        }
    }
}
