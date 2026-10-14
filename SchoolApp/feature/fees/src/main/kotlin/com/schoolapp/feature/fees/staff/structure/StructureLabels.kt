package com.schoolapp.feature.fees.staff.structure

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.fees.structure.FeeFrequency
import com.schoolapp.core.model.fees.structure.FeeHeadKind
import com.schoolapp.core.model.fees.structure.FeePlanStatus
import com.schoolapp.feature.fees.R

@Composable
internal fun frequencyLabel(frequency: FeeFrequency): String = stringResource(
    when (frequency) {
        FeeFrequency.MONTHLY -> R.string.fees_st_freq_monthly
        FeeFrequency.QUARTERLY -> R.string.fees_st_freq_quarterly
        FeeFrequency.TERM -> R.string.fees_st_freq_term
        FeeFrequency.YEARLY -> R.string.fees_st_freq_yearly
        FeeFrequency.ONCE -> R.string.fees_st_freq_once
    },
)

@Composable
internal fun headKindLabel(kind: FeeHeadKind): String =
    stringResource(if (kind == FeeHeadKind.ONE_TIME) R.string.fees_st_kind_one_time else R.string.fees_st_kind_recurring)

@Composable
internal fun planStatusLabel(status: FeePlanStatus): String = stringResource(
    when (status) {
        FeePlanStatus.DRAFT -> R.string.fees_st_status_draft
        FeePlanStatus.APPROVED -> R.string.fees_st_status_approved
        FeePlanStatus.ARCHIVED -> R.string.fees_st_status_archived
    },
)

internal fun planStatusTone(status: FeePlanStatus): StatusTone = when (status) {
    FeePlanStatus.DRAFT -> StatusTone.Warning
    FeePlanStatus.APPROVED -> StatusTone.Success
    FeePlanStatus.ARCHIVED -> StatusTone.Neutral
}
