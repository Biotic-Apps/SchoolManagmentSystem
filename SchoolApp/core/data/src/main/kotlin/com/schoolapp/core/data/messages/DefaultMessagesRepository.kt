package com.schoolapp.core.data.messages

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.approvalId
import com.schoolapp.core.data.common.boolean
import com.schoolapp.core.data.common.orNullIfEmpty
import com.schoolapp.core.data.common.unwrap
import com.schoolapp.core.model.message.ChatMessage
import com.schoolapp.core.model.message.MessageThread
import com.schoolapp.core.model.message.NewThreadInput
import com.schoolapp.core.model.message.SentMessage
import com.schoolapp.core.model.message.ThreadDetail
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.MessagesApi
import com.schoolapp.core.network.dto.message.MessageDto
import com.schoolapp.core.network.dto.message.NewThreadBodyDto
import com.schoolapp.core.network.dto.message.SendMessageBodyDto
import com.schoolapp.core.network.dto.message.ThreadDto
import kotlinx.serialization.json.Json
import java.time.Instant
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultMessagesRepository @Inject constructor(
    private val api: MessagesApi,
    private val apiCaller: ApiCaller,
    private val json: Json,
) : MessagesRepository {

    override suspend fun threads(studentId: String?): AppResult<List<MessageThread>> =
        apiCaller.call { api.threads(studentId).data.map { it.toModel() }.newestFirst() }

    override suspend fun thread(id: String, before: String?): AppResult<ThreadDetail> = apiCaller.call {
        val envelope = api.thread(id, before)
        envelope.data.toModel(envelope.meta?.nextCursor)
    }

    override suspend fun send(threadId: String, body: String, attachmentFileIds: List<String>): AppResult<SentMessage> =
        apiCaller.call {
            val text = body.trim()
            val response = api.send(threadId, SendMessageBodyDto(text, attachmentFileIds.orNullIfEmpty())).data
            val messageJson = response.unwrap("message")
            val message = if (messageJson.containsKey("id")) {
                json.decodeFromJsonElement(MessageDto.serializer(), messageJson).toModel(threadId)
            } else {
                // Probation review hold: nothing was delivered yet, show the text as sent by the caller.
                ChatMessage(response.approvalId() ?: "", threadId, null, "", null, text, emptyList(), Instant.now().toString(), false)
            }
            SentMessage(message, response.boolean("deliveredSilently") ?: messageJson.boolean("deliveredSilently") ?: false)
        }

    override suspend fun startThread(input: NewThreadInput): AppResult<MessageThread> = apiCaller.call {
        val body = NewThreadBodyDto(
            studentId = input.studentId,
            staffUserId = input.staffUserId,
            subject = input.subject.trim(),
            body = input.body.trim(),
            attachmentFileIds = input.attachmentFileIds.orNullIfEmpty(),
        )
        json.decodeFromJsonElement(ThreadDto.serializer(), api.startThread(body).data.unwrap("thread")).toModel()
    }

    override suspend fun markRead(threadId: String): AppResult<Unit> = apiCaller.call { api.markRead(threadId) }
}
