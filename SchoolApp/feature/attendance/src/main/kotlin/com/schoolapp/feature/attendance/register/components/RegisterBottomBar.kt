package com.schoolapp.feature.attendance.register.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.register.RegisterAction

/** Save draft + Submit; helpers get only Save draft and a note that the class teacher submits. */
@Composable
internal fun RegisterBottomBar(
    showSubmit: Boolean,
    isHelper: Boolean,
    busyAction: RegisterAction?,
    onSaveDraft: () -> Unit,
    onSubmit: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(modifier.fillMaxWidth(), color = AppColors.Surface) {
        Column {
            HorizontalDivider(color = AppColors.Border)
            Column(
                Modifier.navigationBarsPadding().padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                if (isHelper) {
                    Text(
                        stringResource(R.string.attendance_helper_note),
                        style = MaterialTheme.typography.bodySmall,
                        color = AppColors.TextSecondary,
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    SecondaryButton(
                        text = stringResource(R.string.attendance_save_draft),
                        onClick = onSaveDraft,
                        enabled = busyAction == null,
                        loading = busyAction == RegisterAction.DRAFT,
                        modifier = Modifier.weight(1f),
                    )
                    if (showSubmit) {
                        PrimaryButton(
                            text = stringResource(R.string.attendance_submit),
                            onClick = onSubmit,
                            enabled = busyAction == null,
                            loading = busyAction == RegisterAction.SUBMIT,
                            modifier = Modifier.weight(1f),
                        )
                    }
                }
            }
        }
    }
}
