package com.schoolapp.feature.messages.conversation

import com.schoolapp.core.model.message.ChatMessage
import com.schoolapp.feature.messages.components.MessageTime
import java.time.LocalDate

/** One row of the conversation list (chronological order). */
sealed interface ChatRow {
    val key: String

    data class Day(val date: LocalDate) : ChatRow {
        override val key: String get() = "day-$date"
    }

    data class Delivered(val message: ChatMessage, val mine: Boolean, val silent: Boolean) : ChatRow {
        override val key: String get() = message.id
    }

    data class Outgoing(val message: PendingMessage) : ChatRow {
        override val key: String get() = message.tempId
    }
}

/** Server messages then local pending ones, with a day separator whenever the date changes. */
internal fun buildChatRows(state: ConversationUiState): List<ChatRow> {
    val rows = mutableListOf<ChatRow>()
    var lastDate: LocalDate? = null
    fun separate(date: LocalDate) {
        if (date != lastDate) rows += ChatRow.Day(date)
        lastDate = date
    }
    state.messages.forEach { message ->
        separate(MessageTime.local(message.sentAt)?.toLocalDate() ?: state.today)
        rows += ChatRow.Delivered(
            message = message,
            mine = message.senderUserId != null && message.senderUserId == state.myUserId,
            silent = message.id in state.silentIds,
        )
    }
    state.pending.forEach { pending ->
        separate(state.today)
        rows += ChatRow.Outgoing(pending)
    }
    return rows
}
