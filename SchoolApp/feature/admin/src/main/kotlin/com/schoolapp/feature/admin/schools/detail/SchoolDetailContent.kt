package com.schoolapp.feature.admin.schools.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Archive
import androidx.compose.material.icons.outlined.DeleteForever
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.Unarchive
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.schools.School
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.AdminFormMaxWidth
import com.schoolapp.feature.admin.schools.components.schoolStatusLabel
import com.schoolapp.feature.admin.schools.components.schoolStatusTone

internal data class SchoolDetailActions(
    val onEdit: () -> Unit,
    val onToggleStatus: () -> Unit,
    val onDelete: () -> Unit,
    val onRefresh: () -> Unit,
)

@Composable
internal fun SchoolDetailContent(state: SchoolDetailUiState, actions: SchoolDetailActions, modifier: Modifier = Modifier) {
    val school = state.school ?: return
    RefreshBox(state.isRefreshing, actions.onRefresh, modifier) {
        ScreenColumn(maxWidth = AdminFormMaxWidth) {
            item(key = "header") { SchoolHeader(school) }
            item(key = "info") { SchoolInfoCard(school) }
            state.actionError?.let { error -> item(key = "error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) } }
            item(key = "actions") { SchoolActions(state, school, actions) }
        }
    }
}

@Composable
private fun SchoolHeader(school: School) {
    Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
        PersonAvatar(school.name, school.logoUrl, size = 64.dp)
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(school.name, style = MaterialTheme.typography.titleLarge, color = AppColors.TextPrimary)
            StatusChip(schoolStatusLabel(school.status), schoolStatusTone(school.status))
        }
    }
}

@Composable
private fun SchoolInfoCard(school: School) {
    val dash = stringResource(R.string.schools_dash)
    AppCard(Modifier.fillMaxWidth()) {
        KeyValueRow(stringResource(R.string.schools_field_code), school.code)
        KeyValueRow(stringResource(R.string.schools_field_branches), school.branchCount.toString())
        KeyValueRow(stringResource(R.string.schools_field_phone), school.phone ?: dash)
        KeyValueRow(stringResource(R.string.schools_field_email), school.email ?: dash)
        KeyValueRow(stringResource(R.string.schools_field_website), school.website ?: dash)
        KeyValueRow(stringResource(R.string.schools_field_created), formatDate(school.createdAt) ?: dash)
        KeyValueRow(stringResource(R.string.schools_field_address), school.address ?: dash)
    }
}

@Composable
private fun SchoolActions(state: SchoolDetailUiState, school: School, actions: SchoolDetailActions) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (state.canEdit) {
            PrimaryButton(
                text = stringResource(R.string.schools_edit),
                onClick = actions.onEdit,
                leadingIcon = Icons.Outlined.Edit,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        if (state.canToggleStatus) {
            SecondaryButton(
                text = stringResource(if (school.isActive) R.string.schools_archive else R.string.schools_restore),
                onClick = actions.onToggleStatus,
                loading = state.isChangingStatus,
                enabled = !state.isChangingStatus,
                leadingIcon = if (school.isActive) Icons.Outlined.Archive else Icons.Outlined.Unarchive,
                contentColor = if (school.isActive) AppColors.Error else AppColors.Primary,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        if (state.canDelete) {
            SecondaryButton(
                text = stringResource(R.string.schools_delete_permanently),
                onClick = actions.onDelete,
                leadingIcon = Icons.Outlined.DeleteForever,
                contentColor = AppColors.Error,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}
