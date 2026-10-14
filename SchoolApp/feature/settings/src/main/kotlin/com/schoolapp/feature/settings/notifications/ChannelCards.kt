package com.schoolapp.feature.settings.notifications

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Mail
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material.icons.outlined.Sms
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.IconTile
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.settings.R

/** Email, SMS, WhatsApp and Push: on/off switch plus the sender setting (disabled while the channel is off). */
@Composable
internal fun ChannelCards(state: NotificationsUiState, canEdit: Boolean, onEdit: ((NotificationForm) -> NotificationForm) -> Unit) {
    val form = state.form
    val email: @Composable (Modifier) -> Unit = { modifier ->
        ChannelCard(Icons.Outlined.Mail, R.string.settings_notifications_email, R.string.settings_notifications_email_hint, modifier) {
            SwitchRow(stringResource(R.string.settings_notifications_email_switch), form.emailEnabled, { on -> onEdit { it.copy(emailEnabled = on) } }, enabled = canEdit)
            AppTextField(
                value = form.emailFromName,
                onValueChange = { value -> if (value.length <= FROM_NAME_MAX) onEdit { it.copy(emailFromName = value) } },
                label = stringResource(R.string.settings_notifications_sender_name),
                enabled = canEdit && form.emailEnabled,
                kind = FieldKind.Title,
                errorText = if (NotificationProblem.FROM_NAME_REQUIRED in state.problems) {
                    stringResource(R.string.settings_notifications_sender_name_required)
                } else {
                    state.serverErrors["email.fromName"]
                },
            )
        }
    }
    val sms: @Composable (Modifier) -> Unit = { modifier ->
        ChannelCard(Icons.Outlined.Sms, R.string.settings_notifications_sms, R.string.settings_notifications_sms_hint, modifier) {
            SwitchRow(stringResource(R.string.settings_notifications_sms_switch), form.smsEnabled, { on -> onEdit { it.copy(smsEnabled = on) } }, enabled = canEdit)
            AppTextField(
                value = form.smsSenderId,
                onValueChange = { value -> if (value.length <= SENDER_ID_MAX) onEdit { it.copy(smsSenderId = value) } },
                label = stringResource(R.string.settings_notifications_sender_id),
                enabled = canEdit && form.smsEnabled,
                kind = FieldKind.Code,
                errorText = if (NotificationProblem.SENDER_ID_REQUIRED in state.problems) {
                    stringResource(R.string.settings_notifications_sender_id_required)
                } else {
                    state.serverErrors["sms.senderId"]
                },
            )
        }
    }
    val whatsapp: @Composable (Modifier) -> Unit = { modifier ->
        ChannelCard(Icons.Outlined.Phone, R.string.settings_notifications_whatsapp, R.string.settings_notifications_whatsapp_hint, modifier) {
            SwitchRow(stringResource(R.string.settings_notifications_whatsapp_switch), form.whatsappEnabled, { on -> onEdit { it.copy(whatsappEnabled = on) } }, enabled = canEdit)
        }
    }
    val push: @Composable (Modifier) -> Unit = { modifier ->
        ChannelCard(Icons.Outlined.Notifications, R.string.settings_notifications_push, R.string.settings_notifications_push_hint, modifier) {
            SwitchRow(stringResource(R.string.settings_notifications_push_switch), form.pushEnabled, { on -> onEdit { it.copy(pushEnabled = on) } }, enabled = canEdit)
        }
    }
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        if (maxWidth >= WIDE) {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    email(Modifier.weight(1f))
                    sms(Modifier.weight(1f))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    whatsapp(Modifier.weight(1f))
                    push(Modifier.weight(1f))
                }
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                listOf(email, sms, whatsapp, push).forEach { it(Modifier.fillMaxWidth()) }
            }
        }
    }
}

@Composable
private fun ChannelCard(icon: ImageVector, title: Int, description: Int, modifier: Modifier, content: @Composable () -> Unit) {
    AppCard(modifier = modifier, verticalSpacing = 12.dp, animateSize = false) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            IconTile(icon, StatusTone.Neutral, size = 40.dp)
            Column(Modifier.weight(1f)) {
                Text(stringResource(title), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                Text(stringResource(description), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
        content()
    }
}

private const val FROM_NAME_MAX = 60
private const val SENDER_ID_MAX = 20
private val WIDE = 600.dp
