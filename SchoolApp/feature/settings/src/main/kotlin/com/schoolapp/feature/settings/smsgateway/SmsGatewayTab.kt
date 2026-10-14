package com.schoolapp.feature.settings.smsgateway

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Smartphone
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.IconTile
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatCard
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.SmsGatewayStatus
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.settings.R
import kotlinx.coroutines.delay

/** Settings › SMS Gateway: connected phone, pending messages and the registration address (refreshes every 30 s). */
@Composable
internal fun SmsGatewayTab(schoolId: String, modifier: Modifier = Modifier) {
    val viewModel: SmsGatewayViewModel = hiltViewModel(key = "sms_gateway_$schoolId")
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(viewModel) {
        while (true) {
            delay(POLL_MS)
            viewModel.poll()
        }
    }
    val status = state.status
    when {
        state.isLoading -> LoadingState(modifier)
        status == null -> ErrorState(
            message = state.error?.let { loadErrorMessage(it) } ?: stringResource(R.string.settings_sms_load_failed),
            modifier = modifier,
            onRetry = viewModel::retry,
        )
        else -> RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
            ScreenColumn {
                item(key = "intro") { GatewayIntro(status) }
                item(key = "stats") { GatewayStats(status) }
                item(key = "register") { GatewayRegistration(state.gatewayUrl) }
            }
        }
    }
}

@Composable
private fun GatewayIntro(status: SmsGatewayStatus) {
    AppCard(verticalSpacing = 16.dp) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            IconTile(Icons.Outlined.Smartphone, StatusTone.Neutral)
            Column(Modifier.weight(1f)) {
                Text(stringResource(R.string.settings_sms_title), style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                Text(stringResource(R.string.settings_sms_description), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
        ConnectionRow(status)
    }
}

@Composable
private fun GatewayStats(status: SmsGatewayStatus) {
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val wide = maxWidth >= WIDE
        val pending: @Composable (Modifier) -> Unit = {
            StatCard(stringResource(R.string.settings_sms_pending), status.pending.toString(), it)
        }
        val enabled: @Composable (Modifier) -> Unit = {
            StatCard(
                label = stringResource(R.string.settings_sms_gateway_status),
                value = stringResource(if (status.enabled) R.string.settings_sms_enabled else R.string.settings_sms_disabled),
                modifier = it,
                tone = if (status.enabled) StatusTone.Success else StatusTone.Neutral,
            )
        }
        val last: @Composable (Modifier) -> Unit = {
            StatCard(
                label = stringResource(R.string.settings_sms_last_sent),
                value = formatTimestamp(status.lastSentAt) ?: stringResource(R.string.settings_sms_never),
                modifier = it,
            )
        }
        if (wide) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                pending(Modifier.weight(1f))
                enabled(Modifier.weight(1f))
                last(Modifier.weight(1f))
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                pending(Modifier.fillMaxWidth())
                enabled(Modifier.fillMaxWidth())
                last(Modifier.fillMaxWidth())
            }
        }
    }
}

private const val POLL_MS = 30_000L
private val WIDE = 600.dp
