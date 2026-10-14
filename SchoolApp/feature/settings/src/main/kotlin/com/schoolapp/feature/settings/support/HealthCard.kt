package com.schoolapp.feature.settings.support

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.SystemHealth
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.settings.R

/** Database, background jobs, file storage and backups at a glance. */
@Composable
internal fun HealthCard(state: SupportHealthUiState, onRefresh: () -> Unit) {
    AppCard(verticalSpacing = 12.dp, animateSize = false) {
        SectionHeader(
            title = stringResource(R.string.settings_support_health),
            subtitle = stringResource(R.string.settings_support_health_hint),
            action = {
                AppTextButton(
                    text = stringResource(R.string.settings_support_refresh),
                    onClick = onRefresh,
                    loading = state.healthLoading && state.health != null,
                    leadingIcon = Icons.Outlined.Refresh,
                )
            },
        )
        val health = state.health
        when {
            state.healthLoading && health == null -> LoadingState(rows = 2)
            health == null -> ErrorState(state.healthError?.let { loadErrorMessage(it) }.orEmpty(), onRetry = onRefresh)
            else -> HealthTiles(health)
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun HealthTiles(health: SystemHealth) {
    val dash = stringResource(R.string.settings_dash)
    BoxWithConstraints {
        val columns = if (maxWidth >= THREE_COLUMNS) 3 else if (maxWidth >= TWO_COLUMNS) 2 else 1
        val tileWidth: Dp = (maxWidth - GAP * (columns - 1)) / columns
        FlowRow(horizontalArrangement = Arrangement.spacedBy(GAP), verticalArrangement = Arrangement.spacedBy(GAP)) {
            Tile(stringResource(R.string.settings_support_database), tileWidth) { OkChip(health.dbOk, R.string.settings_support_down) }
            Tile(
                stringResource(R.string.settings_support_queue),
                tileWidth,
                hint = stringResource(R.string.settings_support_queue_hint, health.queueWaiting, health.queueFailed),
            ) { Value(health.queueDriver ?: dash) }
            Tile(stringResource(R.string.settings_support_storage), tileWidth) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Value(health.storageDriver ?: dash)
                    OkChip(health.storageOk, R.string.settings_support_unreachable)
                }
            }
            Tile(stringResource(R.string.settings_support_last_backup), tileWidth) { Value(formatTimestamp(health.lastBackupAt) ?: dash) }
            Tile(stringResource(R.string.settings_support_last_restore), tileWidth) { Value(formatTimestamp(health.lastRestoreVerified) ?: dash) }
            Tile(stringResource(R.string.settings_support_version), tileWidth) { Value(health.version ?: dash, mono = true) }
        }
    }
}

@Composable
private fun Tile(label: String, width: Dp, hint: String? = null, value: @Composable () -> Unit) {
    Column(
        Modifier.width(width).border(1.dp, AppColors.Border, RoundedCornerShape(10.dp)).padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Text(label, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        value()
        hint?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary) }
    }
}

@Composable
private fun Value(text: String, mono: Boolean = false) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleSmall,
        color = AppColors.TextPrimary,
        fontFamily = if (mono) FontFamily.Monospace else null,
    )
}

@Composable
private fun OkChip(ok: Boolean, downLabel: Int) {
    StatusChip(
        text = stringResource(if (ok) R.string.settings_support_ok else downLabel),
        tone = if (ok) StatusTone.Success else StatusTone.Error,
    )
}

private val GAP = 12.dp
private val TWO_COLUMNS = 440.dp
private val THREE_COLUMNS = 700.dp
