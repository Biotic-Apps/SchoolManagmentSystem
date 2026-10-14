package com.schoolapp.feature.notices

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.feature.notices.feed.NoticesFeedContent
import com.schoolapp.feature.notices.feed.NoticesFeedViewModel
import com.schoolapp.feature.notices.manage.ManageNoticesContent
import com.schoolapp.feature.notices.manage.ManageNoticesViewModel

/**
 * Notices for everyone ("For me" feed); `notices.add` holders also get a "Manage" tab
 * (drafts, status filter, publish, read receipts) and the "New notice" button.
 */
@Composable
internal fun NoticesHome(
    onOpenNotice: (String) -> Unit,
    onCompose: () -> Unit,
    modifier: Modifier = Modifier,
    key: String = "notices",
) {
    val feedViewModel: NoticesFeedViewModel = hiltViewModel(key = "${key}_feed")
    val feed by feedViewModel.uiState.collectAsStateWithLifecycle()
    var tab by rememberSaveable { mutableIntStateOf(0) }
    Box(modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            if (feed.canAdd) {
                AppTabs(
                    titles = listOf(stringResource(R.string.notices_tab_feed), stringResource(R.string.notices_tab_manage)),
                    selectedIndex = tab,
                    onSelect = { tab = it },
                )
            }
            if (feed.canAdd && tab == 1) {
                val manageViewModel: ManageNoticesViewModel = hiltViewModel(key = "${key}_manage")
                val manage by manageViewModel.uiState.collectAsStateWithLifecycle()
                ManageNoticesContent(manage, manageViewModel, onOpen = { onOpenNotice(it.id) })
            } else {
                NoticesFeedContent(
                    state = feed,
                    onRefresh = feedViewModel::refresh,
                    onLoadMore = feedViewModel::loadMore,
                    onOpen = { id -> feedViewModel.onOpen(id)?.let { onOpenNotice(it.id) } },
                    bottomPadding = feed.canAdd,
                )
            }
        }
        if (feed.canAdd) {
            AppFloatingButton(
                text = stringResource(R.string.notices_new),
                icon = Icons.Outlined.Add,
                onClick = onCompose,
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
}
