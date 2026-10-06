package com.schoolapp.feature.notices

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.notices.feed.NoticesFeedContent
import com.schoolapp.feature.notices.feed.NoticesFeedViewModel

/** Menu `notices`: the feed, with "New notice" for roles holding `notices.add`. The VM follows the session, so [role] only scopes state. */
@Composable
fun NoticesMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    val viewModel: NoticesFeedViewModel = hiltViewModel(key = "notices_$role")
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    Box(modifier.fillMaxSize()) {
        NoticesFeedContent(
            state = state,
            onRefresh = viewModel::refresh,
            onOpen = { id -> viewModel.onOpen(id)?.let { onOpen(NoticeDetailDestination(it.id)) } },
            bottomPadding = state.canAdd,
        )
        if (state.canAdd) {
            AppFloatingButton(
                text = stringResource(R.string.notices_new),
                icon = Icons.Outlined.Add,
                onClick = { onOpen(NoticeComposeDestination) },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
}
