package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.messages.DefaultMessagesRepository
import com.schoolapp.core.data.messages.MessagesRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.message.MessageThread
import com.schoolapp.core.model.message.NewThreadInput
import com.schoolapp.core.model.message.SentMessage
import com.schoolapp.core.model.message.ThreadDetail
import kotlinx.coroutines.flow.update
import java.time.LocalTime
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareMessagesRepository @Inject constructor(
    private val real: DefaultMessagesRepository,
    private val auth: DemoAwareAuthRepository,
) : MessagesRepository {

    private val viewerIsParent: Boolean get() = auth.demoSession.value?.activeRole == RoleKey.PARENT

    override suspend fun threads(studentId: String?): AppResult<List<MessageThread>> {
        if (!auth.isDemoActive) return real.threads(studentId)
        return AppResult.Success(
            DemoMessagesData.threads.value
                .filter { studentId == null || it.studentId == studentId }
                .map { DemoMessagesData.toThread(it, viewerIsParent) }
                .sortedByDescending { it.lastMessageAt },
        )
    }

    override suspend fun thread(id: String, before: String?): AppResult<ThreadDetail> {
        if (!auth.isDemoActive) return real.thread(id, before)
        val state = DemoMessagesData.threads.value.firstOrNull { it.id == id } ?: return notFound()
        val userId = auth.demoSession.value?.user?.id
        val messages = state.messages.map { DemoMessagesData.toMessage(id, it, viewerIsParent, userId) }
        return AppResult.Success(ThreadDetail(DemoMessagesData.toThread(state, viewerIsParent), messages, olderCursor = null))
    }

    override suspend fun send(threadId: String, body: String, attachmentFileIds: List<String>): AppResult<SentMessage> {
        if (!auth.isDemoActive) return real.send(threadId, body, attachmentFileIds)
        if (DemoMessagesData.threads.value.none { it.id == threadId }) return notFound()
        val fromParent = viewerIsParent
        val msg = DemoMessagesData.Msg(
            "demo-msg-${System.currentTimeMillis()}", fromParent, body, DemoDates.isoNow(), DemoFiles.attachments(attachmentFileIds),
        )
        DemoMessagesData.threads.update { list ->
            list.map {
                if (it.id != threadId) {
                    it
                } else {
                    it.copy(
                        messages = it.messages + msg,
                        unreadForStaff = if (fromParent) it.unreadForStaff + 1 else 0,
                        unreadForParent = if (fromParent) 0 else it.unreadForParent + 1,
                    )
                }
            }
        }
        val message = DemoMessagesData.toMessage(threadId, msg, fromParent, auth.demoSession.value?.user?.id)
        return AppResult.Success(SentMessage(message.copy(readByOthers = false), deliveredSilently = outsideOfficeHours()))
    }

    override suspend fun startThread(input: NewThreadInput): AppResult<MessageThread> {
        if (!auth.isDemoActive) return real.startThread(input)
        val fromParent = viewerIsParent
        val state = DemoMessagesData.ThreadState(
            id = "demo-th-${System.currentTimeMillis()}",
            subject = input.subject,
            studentId = input.studentId,
            messages = listOf(
                DemoMessagesData.Msg("demo-msg-${System.nanoTime()}", fromParent, input.body, DemoDates.isoNow(), DemoFiles.attachments(input.attachmentFileIds)),
            ),
            unreadForStaff = if (fromParent) 1 else 0,
            unreadForParent = if (fromParent) 0 else 1,
        )
        DemoMessagesData.threads.update { listOf(state) + it }
        return AppResult.Success(DemoMessagesData.toThread(state, fromParent))
    }

    override suspend fun markRead(threadId: String): AppResult<Unit> {
        if (!auth.isDemoActive) return real.markRead(threadId)
        val parent = viewerIsParent
        DemoMessagesData.threads.update { list ->
            list.map {
                when {
                    it.id != threadId -> it
                    parent -> it.copy(unreadForParent = 0)
                    else -> it.copy(unreadForStaff = 0)
                }
            }
        }
        return AppResult.Success(Unit)
    }

    private fun outsideOfficeHours(): Boolean = LocalTime.now().let { it.isBefore(LocalTime.of(8, 0)) || it.isAfter(LocalTime.of(16, 0)) }

    private fun <T> notFound(): AppResult<T> = AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))
}
