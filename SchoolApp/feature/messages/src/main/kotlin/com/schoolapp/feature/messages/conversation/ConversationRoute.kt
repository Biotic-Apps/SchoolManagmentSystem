package com.schoolapp.feature.messages.conversation

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.messages.R
import com.schoolapp.feature.messages.components.studentLine

@Composable
fun ConversationRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ConversationViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let { viewModel.onAttach(it.toString()) }
    }
    val actions = remember(viewModel, external) {
        ConversationActions(
            onRetryLoad = viewModel::load,
            onLoadOlder = viewModel::loadOlder,
            onDraftChange = viewModel::onDraftChange,
            onAttach = { picker.launch("*/*") },
            onRemoveAttachment = viewModel::onRemoveAttachment,
            onSend = viewModel::send,
            onRetrySend = viewModel::retry,
            onOpenAttachment = { attachment -> attachment.url?.let(external::open) },
        )
    }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = state.thread?.subject ?: stringResource(R.string.messages_conversation_title),
                subtitle = state.thread?.let { studentLine(it) },
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        ConversationScreen(
            state = state,
            actions = actions,
            modifier = Modifier.padding(padding).consumeWindowInsets(padding).imePadding(),
        )
    }
}
