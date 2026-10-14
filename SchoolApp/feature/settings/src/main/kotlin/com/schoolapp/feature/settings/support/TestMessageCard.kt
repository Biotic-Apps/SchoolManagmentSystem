package com.schoolapp.feature.settings.support

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.SegmentedChoice
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.settings.R

/** Checks the email and SMS provider settings by sending one message right away. */
@Composable
internal fun TestMessageCard(
    state: SupportHealthUiState,
    onChannel: (TestChannel) -> Unit,
    onTo: (String) -> Unit,
    onSend: () -> Unit,
) {
    val email = state.channel == TestChannel.EMAIL
    AppCard(verticalSpacing = 12.dp, animateSize = false) {
        SectionHeader(
            title = stringResource(R.string.settings_support_test_title),
            subtitle = stringResource(R.string.settings_support_test_hint),
        )
        SegmentedChoice(
            labels = listOf(stringResource(R.string.settings_support_channel_email), stringResource(R.string.settings_support_channel_sms)),
            selectedIndex = state.channel.ordinal,
            onSelect = { onChannel(TestChannel.entries[it]) },
        )
        AppTextField(
            value = state.to,
            onValueChange = onTo,
            label = stringResource(if (email) R.string.settings_support_test_email else R.string.settings_support_test_phone),
            kind = if (email) FieldKind.Email else FieldKind.Phone,
            errorText = when (state.toProblem) {
                TestProblem.REQUIRED -> stringResource(R.string.settings_support_test_required)
                TestProblem.BAD_EMAIL -> stringResource(R.string.settings_support_test_bad_email)
                TestProblem.BAD_PHONE -> stringResource(R.string.settings_support_test_bad_phone)
                null -> null
            },
            onImeAction = onSend,
        )
        state.result?.let { result ->
            if (result.ok) {
                InlineMessage(stringResource(R.string.settings_support_test_sent), StatusTone.Success)
            } else {
                InlineMessage(
                    stringResource(R.string.settings_support_test_not_sent, result.error ?: stringResource(R.string.settings_support_test_rejected)),
                    StatusTone.Error,
                )
            }
        }
        state.sendError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        PrimaryButton(
            text = stringResource(R.string.settings_support_test_send),
            onClick = onSend,
            loading = state.sending,
            leadingIcon = Icons.AutoMirrored.Outlined.Send,
        )
    }
}
