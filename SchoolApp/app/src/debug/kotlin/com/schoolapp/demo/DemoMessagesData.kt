package com.schoolapp.demo

import com.schoolapp.core.model.files.Attachment
import com.schoolapp.core.model.message.ChatMessage
import com.schoolapp.core.model.message.MessageThread
import com.schoolapp.core.model.message.ThreadParticipant
import kotlinx.coroutines.flow.MutableStateFlow
import java.time.LocalDate

/**
 * Two parent <-> teacher threads about Ayesha. Messages remember which side sent them so "mine" follows the
 * previewed role (every demo session shares one user id).
 */
internal object DemoMessagesData {

    data class Msg(val id: String, val fromParent: Boolean, val body: String, val sentAt: String, val attachments: List<Attachment> = emptyList())

    data class ThreadState(
        val id: String,
        val subject: String,
        val studentId: String,
        val messages: List<Msg>,
        val unreadForStaff: Int,
        val unreadForParent: Int,
    )

    val threads = MutableStateFlow(seed())

    val participants = listOf(
        ThreadParticipant(DemoActors.parent.id.orEmpty(), DemoActors.parent.name, "PARENT"),
        ThreadParticipant(DemoActors.teacher.id.orEmpty(), DemoActors.teacher.name, "TEACHER"),
    )

    fun toThread(state: ThreadState, viewerIsParent: Boolean): MessageThread {
        val student = DemoPeopleData.students.firstOrNull { it.id == state.studentId }
        val last = state.messages.lastOrNull()
        return MessageThread(
            id = state.id,
            subject = state.subject,
            studentId = state.studentId,
            studentName = student?.name,
            className = student?.className,
            sectionName = student?.sectionName,
            participants = participants,
            lastMessageBody = last?.body,
            lastMessageAt = last?.sentAt,
            lastSenderName = last?.let { senderName(it) },
            unreadCount = if (viewerIsParent) state.unreadForParent else state.unreadForStaff,
            closed = false,
        )
    }

    fun toMessage(threadId: String, msg: Msg, viewerIsParent: Boolean, viewerUserId: String?): ChatMessage {
        val mine = msg.fromParent == viewerIsParent
        val other = if (msg.fromParent) DemoActors.parent else DemoActors.teacher
        return ChatMessage(
            id = msg.id,
            threadId = threadId,
            senderUserId = if (mine) viewerUserId else other.id,
            senderName = senderName(msg),
            senderRole = if (msg.fromParent) "PARENT" else "TEACHER",
            body = msg.body,
            attachments = msg.attachments,
            sentAt = msg.sentAt,
            readByOthers = true,
        )
    }

    private fun senderName(msg: Msg) = if (msg.fromParent) DemoActors.parent.name else DemoActors.teacher.name

    private fun at(day: LocalDate, time: String) = DemoDates.iso(day, time)

    private fun seed(): List<ThreadState> {
        val today = DemoDates.today()
        val (yesterday, earlier) = DemoDates.previousSchoolDays(3).let { it[0] to it[2] }
        return listOf(
            ThreadState(
                "demo-th-1", "Ayesha's maths homework", DemoPeopleData.CHILD_1,
                listOf(
                    Msg("demo-msg-1", true, "Assalam o Alaikum. Ayesha found the fractions homework difficult yesterday.", at(yesterday, "17:20")),
                    Msg("demo-msg-2", false, "Walaikum Assalam. I'll go over unlike denominators with her again in class.", at(yesterday, "17:45")),
                    Msg("demo-msg-3", true, "Thank you. Is there any extra practice she can do at home?", at(today, "07:30")),
                    Msg("demo-msg-4", true, "Also, could you share the worksheet from Monday?", at(today, "07:32")),
                ),
                unreadForStaff = 2,
                unreadForParent = 0,
            ),
            ThreadState(
                "demo-th-2", "Sports Day kit", DemoPeopleData.CHILD_1,
                listOf(
                    Msg("demo-msg-5", true, "Which house colour should Ayesha wear on Sports Day?", at(earlier, "16:05")),
                    Msg("demo-msg-6", false, "She is in Jinnah House, so a green shirt with the school trousers.", at(earlier, "16:30")),
                    Msg("demo-msg-7", false, "Please also remember to give consent in the app before the deadline.", at(yesterday, "13:10")),
                ),
                unreadForStaff = 0,
                unreadForParent = 1,
            ),
        )
    }
}
