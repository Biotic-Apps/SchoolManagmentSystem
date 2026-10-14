package com.schoolapp.feature.notices.paging

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
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.notices.R

/** Last list row: asks for the next page as soon as it is shown; shows a retry on failure. */
@Composable
internal fun LoadMoreFooter(page: NoticePage, onLoadMore: () -> Unit) {
    val error = page.loadMoreError
    if (error != null) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            InlineMessage(appErrorMessage(error), StatusTone.Error)
            AppTextButton(stringResource(R.string.notices_retry), onClick = onLoadMore)
        }
        return
    }
    LaunchedEffect(page.page) { onLoadMore() }
    Box(Modifier.fillMaxWidth().padding(8.dp), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = AppColors.Primary)
    }
}
