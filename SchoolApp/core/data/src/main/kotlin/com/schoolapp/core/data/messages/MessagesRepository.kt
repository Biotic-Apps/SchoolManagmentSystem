package com.schoolapp.core.data.messages

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.message.MessageThread
import com.schoolapp.core.model.message.NewThreadInput
import com.schoolapp.core.model.message.SentMessage
import com.schoolapp.core.model.message.ThreadDetail

interface MessagesRepository {
    suspend fun threads(studentId: String? = null): AppResult<List<MessageThread>>

    /** Messages oldest first; [before] pages older messages. */
    suspend fun thread(id: String, before: String? = null): AppResult<ThreadDetail>

    suspend fun send(threadId: String, body: String, attachmentFileIds: List<String> = emptyList()): AppResult<SentMessage>
    suspend fun startThread(input: NewThreadInput): AppResult<MessageThread>
    suspend fun markRead(threadId: String): AppResult<Unit>
}
