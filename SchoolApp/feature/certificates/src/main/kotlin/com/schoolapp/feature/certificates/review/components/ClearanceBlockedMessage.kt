package com.schoolapp.feature.certificates.review.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.certificates.ClearanceBlock
import com.schoolapp.feature.certificates.R

/** Why approval was blocked: outstanding dues, unreturned items and any other server reasons. */
@Composable
internal fun ClearanceBlockedMessage(clearance: ClearanceBlock, modifier: Modifier = Modifier) {
    val lines = buildList {
        if (clearance.outstandingMinor > 0) {
            add(stringResource(R.string.certificates_outstanding_fees, MoneyFormat.format(clearance.outstandingMinor)))
        }
        clearance.unreturnedItems.forEach { add(stringResource(R.string.certificates_unreturned_item, it)) }
        addAll(clearance.reasons.filter { it.isNotBlank() })
    }
    Column(modifier, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        InlineMessage(stringResource(R.string.certificates_clearance_needed), StatusTone.Error)
        lines.forEach { line ->
            Text(
                "• $line",
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.Error,
                modifier = Modifier.padding(start = 12.dp),
            )
        }
    }
}
