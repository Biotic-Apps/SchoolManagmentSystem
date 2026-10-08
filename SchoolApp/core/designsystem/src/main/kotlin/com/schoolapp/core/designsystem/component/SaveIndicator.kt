package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CloudDone
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors

/** Autosave progress of a screen: nothing changed yet, a save running, everything saved, or the last save failed. */
enum class SaveStatus { IDLE, SAVING, SAVED, FAILED }

/** "Saving…" / "All changes saved" / "Couldn't save"; announced politely to TalkBack. Renders nothing when idle. */
@Composable
fun SaveIndicator(status: SaveStatus, modifier: Modifier = Modifier) {
    if (status == SaveStatus.IDLE) return
    Row(
        modifier = modifier.semantics { liveRegion = LiveRegionMode.Polite },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        val color = if (status == SaveStatus.FAILED) AppColors.Error else AppColors.TextSecondary
        when (status) {
            SaveStatus.SAVING -> CircularProgressIndicator(Modifier.size(14.dp), color = AppColors.Primary, strokeWidth = 2.dp)
            SaveStatus.FAILED -> Icon(Icons.Outlined.ErrorOutline, contentDescription = null, tint = color, modifier = Modifier.size(16.dp))
            else -> Icon(Icons.Outlined.CloudDone, contentDescription = null, tint = AppColors.Success, modifier = Modifier.size(16.dp))
        }
        Text(
            text = stringResource(
                when (status) {
                    SaveStatus.SAVING -> R.string.ds_saving
                    SaveStatus.FAILED -> R.string.ds_save_failed
                    else -> R.string.ds_all_saved
                },
            ),
            style = MaterialTheme.typography.labelMedium,
            color = color,
        )
    }
}

@Preview
@Composable
private fun SaveIndicatorPreview() = PreviewContainer { SaveIndicator(SaveStatus.SAVED) }
