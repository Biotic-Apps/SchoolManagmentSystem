package com.schoolapp.feature.notices.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Campaign
import androidx.compose.material.icons.outlined.PushPin
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.formatTimestamp
import com.schoolapp.feature.notices.R
import com.schoolapp.feature.notices.components.noticeStatusLabel

@Composable
internal fun NoticeDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: NoticeDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.notices_detail_title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        val contentModifier = Modifier.padding(padding)
        val notice = state.notice
        when {
            state.isLoading -> LoadingState(contentModifier)
            state.error != null -> ErrorState(appErrorMessage(state.error!!), contentModifier, onRetry = viewModel::load)
            notice == null -> EmptyState(stringResource(R.string.notices_not_found), contentModifier, icon = Icons.Outlined.Campaign)
            else -> NoticeDetailContent(notice, contentModifier)
        }
    }
}

@Composable
private fun NoticeDetailContent(notice: Notice, modifier: Modifier = Modifier) {
    ScreenColumn(modifier) {
        item(key = "body") {
            AppCard {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(notice.title, style = MaterialTheme.typography.titleLarge, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
                        if (notice.pinned) {
                            Icon(Icons.Outlined.PushPin, stringResource(R.string.notices_pinned), tint = AppColors.Primary)
                        }
                    }
                    Text(notice.body, style = MaterialTheme.typography.bodyLarge, color = AppColors.TextPrimary)
                }
            }
        }
        item(key = "meta") {
            AppCard {
                KeyValueRow(stringResource(R.string.notices_author), notice.authorName)
                KeyValueRow(stringResource(R.string.notices_published_at), formatTimestamp(notice.publishedAt))
                KeyValueRow(stringResource(R.string.notices_audience), notice.audienceLabel)
                KeyValueRow(stringResource(R.string.notices_expires_on), formatDate(notice.expiresOn) ?: stringResource(R.string.notices_no_expiry))
                KeyValueRow(stringResource(R.string.notices_status), noticeStatusLabel(notice.status))
            }
        }
    }
}
