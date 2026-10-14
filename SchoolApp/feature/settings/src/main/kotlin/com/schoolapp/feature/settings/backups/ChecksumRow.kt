package com.schoolapp.feature.settings.backups

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.settings.R

/** First 12 characters of the SHA-256 plus a button that copies the full value. */
@Composable
internal fun ChecksumRow(checksum: String?, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    var copied by remember(checksum) { mutableStateOf(false) }
    Row(modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Text(
            text = stringResource(R.string.settings_backups_checksum),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
            modifier = Modifier.weight(1f),
        )
        if (checksum.isNullOrBlank()) {
            Text(stringResource(R.string.settings_dash), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
            return@Row
        }
        Text(
            text = checksum.take(SHORT_LENGTH),
            style = MaterialTheme.typography.bodyMedium,
            fontFamily = FontFamily.Monospace,
            color = AppColors.TextPrimary,
        )
        val label = stringResource(R.string.settings_backups_copy_checksum)
        IconButton(onClick = { copied = copy(context, label, checksum) }) {
            Icon(
                imageVector = if (copied) Icons.Outlined.Check else Icons.Outlined.ContentCopy,
                contentDescription = label,
                tint = AppColors.Primary,
            )
        }
    }
}

private fun copy(context: Context, label: String, value: String): Boolean {
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager ?: return false
    clipboard.setPrimaryClip(ClipData.newPlainText(label, value))
    return true
}

private const val SHORT_LENGTH = 12
