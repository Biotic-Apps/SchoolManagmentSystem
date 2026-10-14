package com.schoolapp.feature.messages.conversation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Chat
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ContentMaxWidth
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.motion.rememberShimmerProgress
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.files.Attachment
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.messages.R
import com.schoolapp.feature.messages.components.BubbleStatus
import com.schoolapp.feature.messages.components.DaySeparator
import com.schoolapp.feature.messages.components.MessageBubble
import com.schoolapp.feature.messages.components.MessageComposer
import com.schoolapp.feature.messages.components.MessageTime
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filter

/** Callbacks of the conversation screen, grouped to keep the signature readable. */
internal class ConversationActions(
    val onRetryLoad: () -> Unit,
    val onLoadOlder: () -> Unit,
    val onDraftChange: (String) -> Unit,
    val onAttach: () -> Unit,
    val onRemoveAttachment: (String) -> Unit,
    val onSend: () -> Unit,
    val onRetrySend: (String) -> Unit,
    val onOpenAttachment: (Attachment) -> Unit,
)

@Composable
internal fun ConversationScreen(state: ConversationUiState, actions: ConversationActions, modifier: Modifier = Modifier) {
    when {
        state.isLoading -> ChatLoadingSkeleton(modifier)
        state.error != null && state.thread == null ->
            ErrorState(loadErrorMessage(state.error), modifier, onRetry = actions.onRetryLoad)
        else -> Column(modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
            ChatList(state, actions, Modifier.weight(1f).widthIn(max = ContentMaxWidth).fillMaxWidth())
            Box(Modifier.widthIn(max = ContentMaxWidth).fillMaxWidth()) {
                if (state.readOnly) {
                    InlineMessage(stringResource(R.string.messages_read_only_note), StatusTone.Info, Modifier.padding(16.dp))
                } else if (state.closed) {
                    InlineMessage(stringResource(R.string.messages_thread_closed_note), StatusTone.Neutral, Modifier.padding(16.dp))
                } else {
                    MessageComposer(
                        draft = state.draft,
                        attachments = state.draftAttachments,
                        uploading = state.uploadingCount > 0,
                        attachError = state.attachError,
                        canSend = state.canSend,
                        onDraftChange = actions.onDraftChange,
                        onAttach = actions.onAttach,
                        onRemoveAttachment = actions.onRemoveAttachment,
                        onSend = actions.onSend,
                    )
                }
            }
        }
    }
}

/** Newest at the bottom (reverse layout); reaching the top pages older messages. */
@Composable
private fun ChatList(state: ConversationUiState, actions: ConversationActions, modifier: Modifier = Modifier) {
    val rows = remember(state.messages, state.pending, state.silentIds, state.myUserId, state.today) {
        buildChatRows(state).asReversed()
    }
    if (rows.isEmpty()) {
        EmptyState(
            title = stringResource(R.string.messages_no_messages_title),
            message = stringResource(R.string.messages_no_messages),
            modifier = modifier,
            icon = Icons.AutoMirrored.Outlined.Chat,
        )
        return
    }
    val listState = rememberLazyListState()
    val loadOlder by rememberUpdatedState(actions.onLoadOlder)
    LaunchedEffect(listState) {
        snapshotFlow {
            val info = listState.layoutInfo
            val last = info.visibleItemsInfo.lastOrNull()?.index ?: 0
            info.totalItemsCount > 0 && last >= info.totalItemsCount - 2
        }.distinctUntilChanged().filter { it }.collect { loadOlder() }
    }
    val newest = rows.first()
    LaunchedEffect(newest.key) {
        // Follow a new message only when it is our own send or the reader is already at the bottom;
        // polling/refresh must never yank someone reading older messages back down.
        if (newest is ChatRow.Outgoing || listState.firstVisibleItemIndex <= NEAR_BOTTOM_ROWS) listState.animateScrollToItem(0)
    }
    LazyColumn(
        modifier = modifier,
        state = listState,
        reverseLayout = true,
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(rows, key = { it.key }) { row -> ChatRowItem(row, state, actions) }
        if (state.olderCursor != null) {
            item(key = "older") {
                if (state.isLoadingOlder) {
                    LoadingState(message = stringResource(R.string.messages_loading_older))
                } else {
                    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        AppTextButton(stringResource(R.string.messages_load_older), actions.onLoadOlder)
                    }
                }
            }
        }
    }
}

@Composable
private fun ChatRowItem(row: ChatRow, state: ConversationUiState, actions: ConversationActions) {
    when (row) {
        is ChatRow.Day -> DaySeparator(row.date, state.today)
        is ChatRow.Delivered -> MessageBubble(
            body = row.message.body,
            attachments = row.message.attachments,
            mine = row.mine,
            senderName = row.message.senderName,
            time = MessageTime.time(row.message.sentAt),
            fullTimestamp = MessageTime.fullTimestamp(row.message.sentAt),
            status = when {
                !row.mine -> BubbleStatus.RECEIVED
                row.message.readByOthers -> BubbleStatus.READ
                else -> BubbleStatus.SENT
            },
            silent = row.silent,
            onOpenAttachment = actions.onOpenAttachment,
        )
        is ChatRow.Outgoing -> MessageBubble(
            body = row.message.body,
            attachments = row.message.attachments,
            mine = true,
            senderName = null,
            time = null,
            fullTimestamp = null,
            status = if (row.message.failed) BubbleStatus.FAILED else BubbleStatus.SENDING,
            onOpenAttachment = actions.onOpenAttachment,
            onRetry = { actions.onRetrySend(row.message.tempId) },
        )
    }
}

/** Chat-bubble loading skeleton that mimics a conversation layout. */
@Composable
private fun ChatLoadingSkeleton(modifier: Modifier = Modifier) {
    val progress = rememberShimmerProgress()
    Column(
        modifier = modifier.fillMaxSize().padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp, Alignment.Bottom),
    ) {
        SkeletonBubble(mine = false, widthFraction = 0.65f, progress = progress.value)
        SkeletonBubble(mine = true, widthFraction = 0.55f, progress = progress.value)
        SkeletonBubble(mine = false, widthFraction = 0.75f, progress = progress.value)
        SkeletonBubble(mine = true, widthFraction = 0.45f, progress = progress.value)
        SkeletonBubble(mine = false, widthFraction = 0.60f, progress = progress.value)
    }
}

@Composable
private fun SkeletonBubble(mine: Boolean, widthFraction: Float, progress: Float) {
    val shape = if (mine) {
        RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp, bottomStart = 16.dp, bottomEnd = 4.dp)
    } else {
        RoundedCornerShape(topStart = 4.dp, topEnd = 16.dp, bottomStart = 16.dp, bottomEnd = 16.dp)
    }
    val shimmer = AppColors.Border.copy(alpha = 0.3f + 0.15f * progress)
    val shimmerDark = AppColors.Border.copy(alpha = 0.15f + 0.1f * progress)
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (mine) Arrangement.End else Arrangement.Start,
        verticalAlignment = Alignment.Bottom,
    ) {
        if (!mine) {
            Box(
                Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(shimmer)
            )
            Spacer(Modifier.width(8.dp))
        }
        Column(
            modifier = Modifier
                .fillMaxWidth(widthFraction)
                .clip(shape)
                .background(shimmerDark)
                .padding(horizontal = 12.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Box(Modifier.fillMaxWidth(0.9f).height(12.dp).clip(RoundedCornerShape(4.dp)).background(shimmer))
            Box(Modifier.fillMaxWidth(0.6f).height(12.dp).clip(RoundedCornerShape(4.dp)).background(shimmer))
        }
    }
}

/** A new message plus its day separator can push the previous newest row this far from the bottom. */
private const val NEAR_BOTTOM_ROWS = 2
