package com.schoolapp.feature.meetings.detail.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.domain.FollowUpDraft

@Composable
internal fun FollowUpDraftRow(
    draft: FollowUpDraft,
    titleError: Boolean,
    dateError: Boolean,
    enabled: Boolean,
    onTitleChange: (String) -> Unit,
    onPickDate: () -> Unit,
    onRemove: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, AppColors.Border),
        color = AppColors.Surface,
    ) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            AppTextField(
                value = draft.title,
                onValueChange = onTitleChange,
                label = stringResource(R.string.meetings_follow_up_title),
                errorText = stringResource(R.string.meetings_error_follow_up_title).takeIf { titleError },
                enabled = enabled,
            )
            PickerField(
                value = formatDate(draft.dueDate).orEmpty(),
                label = stringResource(R.string.meetings_follow_up_due_date),
                onClick = onPickDate,
                errorText = stringResource(R.string.meetings_error_follow_up_date).takeIf { dateError },
                enabled = enabled,
            )
            AppTextButton(
                text = stringResource(R.string.meetings_remove_follow_up),
                onClick = onRemove,
                enabled = enabled,
                leadingIcon = Icons.Outlined.Delete,
                contentColor = AppColors.Error,
            )
        }
    }
}
