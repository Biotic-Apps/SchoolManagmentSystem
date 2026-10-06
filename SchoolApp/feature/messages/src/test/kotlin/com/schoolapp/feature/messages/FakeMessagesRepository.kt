package com.schoolapp.feature.messages

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.messages.MessagesRepository
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.model.files.UploadedFile
import com.schoolapp.core.model.message.ChatMessage
import com.schoolapp.core.model.message.MessageThread
import com.schoolapp.core.model.message.NewThreadInput
import com.schoolapp.core.model.message.SentMessage
import com.schoolapp.core.model.message.ThreadDetail
import kotlinx.coroutines.CompletableDeferred

fun testThread(id: String = "t1", studentId: String = "c1") = MessageThread(
    id = id, subject = "Homework", studentId = studentId, studentName = "Ayesha", className = "Class 5", sectionName = "A",
    participants = emptyList(), lastMessageBody = "Hi", lastMessageAt = "2026-10-06T05:00:00Z", lastSenderName = "Sara",
    unreadCount = 1, closed = false,
)

fun testMessage(id: String, body: String = "Hello", sender: String = "u2") = ChatMessage(
    id = id, threadId = "t1", senderUserId = sender, senderName = "Teacher", senderRole = "TEACHER", body = body,
    attachments = emptyList(), sentAt = "2026-10-06T05:00:00Z", readByOthers = false,
)

class FakeMessagesRepository : MessagesRepository {
    val threadRequests = mutableListOf<String?>()
    val sends = mutableListOf<Pair<String, List<String>>>()
    var markReadCalls = 0
    var sendGate: CompletableDeferred<Unit>? = null
    var sendError: AppError? = null
    var silent = false

    override suspend fun threads(studentId: String?): AppResult<List<MessageThread>> {
        threadRequests += studentId
        return AppResult.Success(listOf(testThread(id = "thread-${studentId ?: "all"}", studentId = studentId ?: "x")))
    }

    override suspend fun thread(id: String, before: String?): AppResult<ThreadDetail> =
        AppResult.Success(ThreadDetail(testThread(id), listOf(testMessage("m1")), olderCursor = null))

    override suspend fun send(threadId: String, body: String, attachmentFileIds: List<String>): AppResult<SentMessage> {
        sends += body to attachmentFileIds
        sendGate?.await()
        sendError?.let { return AppResult.Failure(it) }
        return AppResult.Success(SentMessage(testMessage("server-${sends.size}", body, sender = "u1"), silent))
    }

    override suspend fun startThread(input: NewThreadInput): AppResult<MessageThread> = AppResult.Success(testThread())

    override suspend fun markRead(threadId: String): AppResult<Unit> {
        markReadCalls++
        return AppResult.Success(Unit)
    }
}

class FakeFilesRepository : FilesRepository {
    override suspend fun upload(uri: String, purpose: FilePurpose): AppResult<UploadedFile> =
        AppResult.Success(UploadedFile("f-$uri", "https://files/$uri", "image/png", 10, "photo.png"))
}
