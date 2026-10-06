package com.schoolapp.feature.progress.homework.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
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
import com.schoolapp.feature.progress.R

@Composable
internal fun HomeworkSaveBar(ticked: Int, total: Int, saving: Boolean, onSave: () -> Unit, modifier: Modifier = Modifier) {
    Surface(color = AppColors.Surface, modifier = modifier.fillMaxWidth()) {
        Box(contentAlignment = Alignment.Center) {
            HorizontalDivider(color = AppColors.Border, modifier = Modifier.align(Alignment.TopCenter))
            Row(
                modifier = Modifier
                    .widthIn(max = ContentMaxWidth)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text(
                    stringResource(R.string.progress_ticked_count, ticked, total),
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                    modifier = Modifier.weight(1f),
                )
                PrimaryButton(stringResource(R.string.progress_save_ticks), onSave, loading = saving)
            }
        }
    }
}
