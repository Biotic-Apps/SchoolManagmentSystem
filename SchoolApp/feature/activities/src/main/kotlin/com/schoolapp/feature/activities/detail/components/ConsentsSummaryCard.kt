package com.schoolapp.feature.activities.detail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
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
import com.schoolapp.core.designsystem.component.StatCard
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.activity.ActivityConsent
import com.schoolapp.core.model.activity.ConsentStatus
import com.schoolapp.feature.activities.R
import com.schoolapp.feature.activities.components.labelRes
import com.schoolapp.feature.activities.components.tone

/** Staff view of permission slips: counts per answer and one row per student. */
@Composable
internal fun ConsentsSummaryCard(consents: List<ActivityConsent>, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(ConsentStatus.GRANTED, ConsentStatus.DECLINED, ConsentStatus.PENDING).forEach { status ->
                StatCard(
                    label = stringResource(status.labelRes()),
                    value = consents.count { it.status == status }.toString(),
                    tone = status.tone(),
                    modifier = Modifier.weight(1f),
                )
            }
        }
        if (consents.isNotEmpty()) {
            AppCard(contentPadding = 0.dp) {
                consents.forEachIndexed { index, consent ->
                    if (index > 0) HorizontalDivider(color = AppColors.Border)
                    ConsentRow(consent)
                }
            }
        }
    }
}

@Composable
private fun ConsentRow(consent: ActivityConsent) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Column(Modifier.weight(1f)) {
            Text(consent.studentName, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
            consent.guardianName?.takeIf { it.isNotBlank() }?.let {
                Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
        }
        StatusChip(stringResource(consent.status.labelRes()), consent.status.tone())
    }
}
