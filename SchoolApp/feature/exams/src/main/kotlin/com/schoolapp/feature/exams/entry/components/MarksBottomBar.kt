package com.schoolapp.feature.exams.entry.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
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
import com.schoolapp.feature.exams.entry.MarksAction

/** Save draft + Submit (Submit only with `exams.submit`). */
@Composable
internal fun MarksBottomBar(
    showSubmit: Boolean,
    busyAction: MarksAction?,
    onSaveDraft: () -> Unit,
    onSubmit: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(modifier.fillMaxWidth(), color = AppColors.Surface) {
        Column {
            HorizontalDivider(color = AppColors.Border)
            Row(
                Modifier.navigationBarsPadding().imePadding().padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                SecondaryButton(
                    text = stringResource(R.string.exams_save_draft),
                    onClick = onSaveDraft,
                    enabled = busyAction == null,
                    loading = busyAction == MarksAction.DRAFT,
                    modifier = Modifier.weight(1f),
                )
                if (showSubmit) {
                    PrimaryButton(
                        text = stringResource(R.string.exams_submit),
                        onClick = onSubmit,
                        enabled = busyAction == null,
                        loading = busyAction == MarksAction.SUBMIT,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
    }
}
