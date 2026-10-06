package com.schoolapp.feature.activities.detail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.components.labelRes
import com.schoolapp.feature.activities.components.tone
import com.schoolapp.feature.activities.domain.FeeFormat

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun ActivityInfoCard(activity: Activity, timeRange: String, modifier: Modifier = Modifier) {
    AppCard(modifier) {
        Text(activity.title, style = MaterialTheme.typography.titleLarge, color = AppColors.TextPrimary)
        Spacer(Modifier.height(8.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            StatusChip(stringResource(activity.type.labelRes()), StatusTone.Neutral)
            StatusChip(stringResource(activity.status.labelRes()), activity.status.tone())
        }
        Spacer(Modifier.height(8.dp))
        KeyValueRow(stringResource(R.string.activities_when), timeRange)
        KeyValueRow(stringResource(R.string.activities_venue), activity.venue)
        KeyValueRow(stringResource(R.string.activities_audience), activity.audienceLabel)
        activity.feeMinor?.takeIf { it > 0 }?.let { KeyValueRow(stringResource(R.string.activities_fee), FeeFormat.format(it)) }
        activity.maxParticipants?.let { KeyValueRow(stringResource(R.string.activities_max_participants), it.toString()) }
        if (activity.consentRequired) {
            KeyValueRow(stringResource(R.string.activities_consent_deadline), formatTimestamp(activity.consentDeadline))
        }
        activity.proposedBy?.takeIf { it.isNotBlank() }?.let { KeyValueRow(stringResource(R.string.activities_proposed_by), it) }
        activity.description?.takeIf { it.isNotBlank() }?.let {
            Spacer(Modifier.height(8.dp))
            Text(it, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
        }
    }
}
