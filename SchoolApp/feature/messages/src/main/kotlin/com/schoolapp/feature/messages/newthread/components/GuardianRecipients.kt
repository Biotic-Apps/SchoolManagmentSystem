package com.schoolapp.feature.messages.newthread.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.GuardianLink
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.messages.R

/** Staff: who will receive the message (the student's linked guardians). */
@Composable
internal fun GuardianRecipients(guardians: List<GuardianLink>, isLoading: Boolean, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeader(stringResource(R.string.messages_recipients), subtitle = stringResource(R.string.messages_recipients_hint))
        when {
            isLoading -> LoadingState()
            guardians.isEmpty() -> InlineMessage(stringResource(R.string.messages_no_guardians), StatusTone.Warning)
            else -> AppCard(contentPadding = 0.dp) {
                guardians.forEachIndexed { index, link ->
                    if (index > 0) HorizontalDivider(color = AppColors.Border)
                    GuardianLine(link)
                }
            }
        }
    }
}

@Composable
private fun GuardianLine(link: GuardianLink) {
    Row(
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        PersonAvatar(link.guardian.name, photoUrl = null)
        Column(Modifier.weight(1f)) {
            Text(link.guardian.name, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
            (link.relation ?: link.guardian.relation)?.let {
                Text(humanizeKey(it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
        if (!link.guardian.hasAccount) StatusChip(stringResource(R.string.messages_no_app_account), StatusTone.Warning)
    }
}
