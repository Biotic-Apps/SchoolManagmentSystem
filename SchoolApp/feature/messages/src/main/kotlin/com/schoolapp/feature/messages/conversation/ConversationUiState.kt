package com.schoolapp.feature.messages.conversation

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.files.Attachment
import com.schoolapp.core.model.message.ChatMessage
import com.schoolapp.core.model.message.MessageThread
import java.time.LocalDate

/** A message shown before the server confirms it; [failed] offers a retry with the same content. */
@Immutable
data class PendingMessage(
    val tempId: String,
    val body: String,
    val attachments: List<Attachment>,
    val failed: Boolean = false,
)

@Immutable
data class ConversationUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val thread: MessageThread? = null,
    val myUserId: String? = null,
    val messages: List<ChatMessage> = emptyList(),
    val pending: List<PendingMessage> = emptyList(),
    val olderCursor: String? = null,
    val isLoadingOlder: Boolean = false,
    /** Server message ids returned with `deliveredSilently = true`. */
    val silentIds: Set<String> = emptySet(),
    val draft: String = "",
    val draftAttachments: List<Attachment> = emptyList(),
    val uploadingCount: Int = 0,
    val attachError: AppError? = null,
    val today: LocalDate = LocalDate.MIN,
) {
    val closed: Boolean get() = thread?.closed == true

    /** Branch manager reading someone else's thread (audited, cannot reply). */
    val readOnly: Boolean
        get() {
            val participants = thread?.participants.orEmpty()
            return myUserId != null && participants.isNotEmpty() && participants.none { it.userId == myUserId }
        }

    val canSend: Boolean
        get() = !closed && !readOnly && uploadingCount == 0 && (draft.isNotBlank() || draftAttachments.isNotEmpty())
}
