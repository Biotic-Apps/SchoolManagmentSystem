package com.schoolapp.feature.meetings.components

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
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.meetings.R
import com.schoolapp.feature.meetings.domain.MeetingPage

/** Last row of a paged meeting list: loads the next page when it scrolls into view; retry on failure. */
@Composable
internal fun LoadMoreRow(page: MeetingPage, onLoadMore: () -> Unit, onRetry: () -> Unit, modifier: Modifier = Modifier) {
    val error = page.loadMoreError
    if (error != null) {
        Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
            InlineMessage(loadErrorMessage(error), StatusTone.Error)
            AppTextButton(stringResource(R.string.meetings_retry), onClick = onRetry)
        }
        return
    }
    LaunchedEffect(page.page) { onLoadMore() }
    Box(modifier.fillMaxWidth().padding(8.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
}
