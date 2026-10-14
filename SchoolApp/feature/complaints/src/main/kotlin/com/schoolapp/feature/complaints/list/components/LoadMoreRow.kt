package com.schoolapp.feature.complaints.list.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.complaints.R

/** Last list row: requests the next page when it scrolls into view; shows a retry on failure. */
@Composable
internal fun LoadMoreRow(page: Int, error: AppError?, onLoadMore: () -> Unit, onRetry: () -> Unit) {
    if (error != null) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            InlineMessage(loadErrorMessage(error), StatusTone.Error)
            AppTextButton(stringResource(R.string.complaints_assign_retry), onClick = onRetry)
        }
        return
    }
    LaunchedEffect(page) { onLoadMore() }
    Box(Modifier.fillMaxWidth().padding(8.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
}
