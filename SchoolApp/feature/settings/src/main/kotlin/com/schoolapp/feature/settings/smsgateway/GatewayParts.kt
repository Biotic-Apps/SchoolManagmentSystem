package com.schoolapp.feature.settings.smsgateway

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ContentCopy
import androidx.compose.material.icons.outlined.QrCode2
import androidx.compose.material.icons.outlined.Wifi
import androidx.compose.material.icons.outlined.WifiOff
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.SmsGatewayStatus
import com.schoolapp.feature.settings.R

@Composable
internal fun ConnectionRow(status: SmsGatewayStatus) {
    val connected = status.deviceId != null
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(
            imageVector = if (connected) Icons.Outlined.Wifi else Icons.Outlined.WifiOff,
            contentDescription = null,
            tint = if (connected) AppColors.Success else AppColors.TextSecondary,
        )
        Column(Modifier.weight(1f)) {
            Text(
                text = stringResource(if (connected) R.string.settings_sms_connected_title else R.string.settings_sms_disconnected_title),
                style = MaterialTheme.typography.bodyLarge,
                color = AppColors.TextPrimary,
            )
            Text(
                text = if (connected) {
                    stringResource(R.string.settings_sms_device, status.deviceId.orEmpty())
                } else {
                    stringResource(R.string.settings_sms_disconnected_hint)
                },
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
            )
        }
        StatusChip(
            text = stringResource(if (connected) R.string.settings_sms_connected else R.string.settings_sms_disconnected),
            tone = if (connected) StatusTone.Success else StatusTone.Neutral,
        )
    }
}

/** Registration address with a copy button. */
@Composable
internal fun GatewayRegistration(url: String) {
    val context = LocalContext.current
    val copyLabel = stringResource(R.string.settings_sms_copy_url)
    AppCard(verticalSpacing = 12.dp) {
        Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Icon(Icons.Outlined.QrCode2, contentDescription = null, tint = AppColors.TextSecondary)
            Text(stringResource(R.string.settings_sms_register_title), style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
            Text(
                text = stringResource(R.string.settings_sms_register_hint),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
                textAlign = TextAlign.Center,
            )
            Text(
                text = url,
                style = MaterialTheme.typography.bodySmall,
                fontFamily = FontFamily.Monospace,
                color = AppColors.TextPrimary,
                modifier = Modifier
                    .fillMaxWidth()
                    .background(AppColors.Selected, RoundedCornerShape(8.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
            )
            AppTextButton(text = copyLabel, onClick = { copy(context, copyLabel, url) }, leadingIcon = Icons.Outlined.ContentCopy)
            Text(
                text = stringResource(R.string.settings_sms_register_footer),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
                textAlign = TextAlign.Center,
            )
        }
    }
}

private fun copy(context: Context, label: String, value: String) {
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager ?: return
    clipboard.setPrimaryClip(ClipData.newPlainText(label, value))
}
