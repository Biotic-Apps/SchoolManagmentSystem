package com.schoolapp.feature.exams.review.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.exams.R

/** Return (back to the teacher) + Accept for a submitted sheet. */
@Composable
internal fun ReviewBottomBar(onReturn: () -> Unit, onAccept: () -> Unit, modifier: Modifier = Modifier) {
    Surface(modifier.fillMaxWidth(), color = AppColors.Surface) {
        Column {
            HorizontalDivider(color = AppColors.Border)
            Row(Modifier.navigationBarsPadding().padding(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                SecondaryButton(
                    text = stringResource(R.string.exams_return),
                    onClick = onReturn,
                    contentColor = AppColors.Error,
                    modifier = Modifier.weight(1f),
                )
                PrimaryButton(text = stringResource(R.string.exams_accept), onClick = onAccept, modifier = Modifier.weight(1f))
            }
        }
    }
}
