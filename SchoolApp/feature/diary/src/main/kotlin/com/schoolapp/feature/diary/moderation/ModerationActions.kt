package com.schoolapp.feature.diary.moderation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Publish
import androidx.compose.material.icons.outlined.Undo
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.diary.R

/** Footer of a SUBMITTED entry for supervisors: Publish directly or Return to the teacher. */
@Composable
internal fun ModerationActions(
    publishing: Boolean,
    onPublish: () -> Unit,
    onReturn: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    Row(modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp, androidx.compose.ui.Alignment.End)) {
        AppTextButton(
            stringResource(R.string.diary_return_action),
            onReturn,
            enabled = enabled && !publishing,
            leadingIcon = Icons.Outlined.Undo,
            contentColor = AppColors.Error,
        )
        AppTextButton(
            stringResource(R.string.diary_publish),
            onPublish,
            enabled = enabled,
            loading = publishing,
            leadingIcon = Icons.Outlined.Publish,
        )
    }
}
