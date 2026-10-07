package com.schoolapp.feature.attendance.staffmark.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Save
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.ContentMaxWidth
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.attendance.R

/** Pinned Save for the staff register; enabled only with unsaved changes. */
@Composable
internal fun StaffSaveBar(dirty: Boolean, saving: Boolean, onSave: () -> Unit, modifier: Modifier = Modifier) {
    Surface(modifier.fillMaxWidth(), color = AppColors.Surface) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            HorizontalDivider(color = AppColors.Border)
            Row(
                Modifier.widthIn(max = ContentMaxWidth).fillMaxWidth().padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    stringResource(if (dirty) R.string.attendance_unsaved_changes else R.string.attendance_staff_all_saved),
                    style = MaterialTheme.typography.bodySmall,
                    color = if (dirty) AppColors.Warning else AppColors.TextSecondary,
                    modifier = Modifier.weight(1f),
                )
                PrimaryButton(
                    text = stringResource(R.string.attendance_staff_save),
                    onClick = onSave,
                    enabled = dirty && !saving,
                    loading = saving,
                    leadingIcon = Icons.Outlined.Save,
                )
            }
        }
    }
}
