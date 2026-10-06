package com.schoolapp.feature.certificates.review.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.certificates.R

@Composable
internal fun ReviewActions(busy: Boolean, onApprove: () -> Unit, onReject: () -> Unit, modifier: Modifier = Modifier) {
    Row(modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        SecondaryButton(
            text = stringResource(R.string.certificates_reject),
            onClick = onReject,
            enabled = !busy,
            contentColor = AppColors.Error,
            modifier = Modifier.weight(1f),
        )
        PrimaryButton(
            text = stringResource(R.string.certificates_approve),
            onClick = onApprove,
            loading = busy,
            enabled = !busy,
            modifier = Modifier.weight(1f),
        )
    }
}
