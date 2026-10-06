package com.schoolapp.feature.notices.feed

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.feature.notices.R

/** Full-screen feed for roles without a notices menu entry (parents, teachers). */
@Composable
internal fun NoticesRoute(
    onBack: () -> Unit,
    onOpenNotice: (String) -> Unit,
    onCompose: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: NoticesFeedViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.notices_title), navigationIcon = { BackButton(onBack) }) },
        floatingActionButton = {
            if (state.canAdd) AppFloatingButton(stringResource(R.string.notices_new), Icons.Outlined.Add, onCompose)
        },
    ) { padding ->
        NoticesFeedContent(
            state = state,
            onRefresh = viewModel::refresh,
            onOpen = { id -> viewModel.onOpen(id)?.let { onOpenNotice(it.id) } },
            modifier = Modifier.padding(padding),
            bottomPadding = state.canAdd,
        )
    }
}
