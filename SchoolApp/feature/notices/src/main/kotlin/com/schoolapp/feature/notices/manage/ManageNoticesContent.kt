package com.schoolapp.feature.notices.manage

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Campaign
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.notices.R
import com.schoolapp.feature.notices.components.ComposeResultMessage
import com.schoolapp.feature.notices.components.ManageNoticeCard
import com.schoolapp.feature.notices.components.noticeStatusLabel
import com.schoolapp.feature.notices.paging.NoticeList

/** Status filter + paged list of the branch's notices; drafts get a Publish action. */
@Composable
internal fun ManageNoticesContent(
    state: ManageNoticesUiState,
    viewModel: ManageNoticesViewModel,
    onOpen: (Notice) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxSize()) {
        StatusFilter(state.status, viewModel::onStatusChange)
        state.actionError?.let { error ->
            InlineMessage(appErrorMessage(error), StatusTone.Error, Modifier.padding(horizontal = 16.dp))
        }
        NoticeList(
            page = state.page,
            onRefresh = viewModel::refresh,
            onLoadMore = viewModel::loadMore,
            bottomPadding = true,
            header = { state.message?.let { message -> item(key = "message") { ComposeResultMessage(message) } } },
            empty = {
                EmptyState(
                    stringResource(R.string.notices_manage_empty),
                    message = stringResource(R.string.notices_manage_empty_message),
                    icon = Icons.Outlined.Campaign,
                )
            },
            row = { notice ->
                val canPublishRow = state.canPublish && notice.status == NoticeStatus.DRAFT
                ManageNoticeCard(
                    notice = notice,
                    onClick = {
                        viewModel.onOpen(notice)
                        onOpen(notice)
                    },
                    onPublish = if (canPublishRow) {
                        { viewModel.publish(notice) }
                    } else {
                        null
                    },
                    publishing = state.publishingId == notice.id,
                )
            },
        )
    }
}

@Composable
private fun StatusFilter(selected: NoticeStatus?, onSelect: (NoticeStatus?) -> Unit) {
    val options = listOf(SwitcherOption(ALL, stringResource(R.string.notices_filter_all))) +
        NoticeStatus.entries.map { SwitcherOption(it.name, noticeStatusLabel(it)) }
    FilterChipRow(
        options = options,
        selectedId = selected?.name ?: ALL,
        onSelect = { id -> onSelect(NoticeStatus.entries.firstOrNull { it.name == id }) },
        modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 12.dp),
    )
}

private const val ALL = "ALL"
