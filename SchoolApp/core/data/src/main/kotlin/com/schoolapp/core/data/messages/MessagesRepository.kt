package com.schoolapp.core.data.messages

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.message.MessageRecipient
import com.schoolapp.core.model.message.MessageThread
import com.schoolapp.core.model.message.NewThreadInput
import com.schoolapp.core.model.message.SentMessage
import com.schoolapp.core.model.message.ThreadDetail
import com.schoolapp.core.model.message.ThreadQuery
import com.schoolapp.core.model.settings.PagedList

interface MessagesRepository {
    suspend fun threads(studentId: String? = null): AppResult<List<MessageThread>>

    /** One server page of threads, newest activity first. */
    suspend fun threadsPage(query: ThreadQuery, page: Int, pageSize: Int): AppResult<PagedList<MessageThread>>

    /** Staff a parent may write to about [studentId]. */
    suspend fun recipients(studentId: String): AppResult<List<MessageRecipient>>

    /** Messages oldest first; [before] pages older messages. */
    suspend fun thread(id: String, before: String? = null): AppResult<ThreadDetail>

    suspend fun send(threadId: String, body: String, attachmentFileIds: List<String> = emptyList()): AppResult<SentMessage>
    suspend fun startThread(input: NewThreadInput): AppResult<MessageThread>
    suspend fun markRead(threadId: String): AppResult<Unit>
}
