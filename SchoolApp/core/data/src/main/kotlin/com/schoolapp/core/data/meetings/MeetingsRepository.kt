package com.schoolapp.core.data.meetings

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.meeting.CompleteMeetingInput
import com.schoolapp.core.model.meeting.FollowUp
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.core.model.meeting.MeetingSlot

interface MeetingsRepository {
    /** Open slots the caller may book (server-scoped to the child's teachers for parents). */
    suspend fun openSlots(from: String, to: String, staffUserId: String? = null): AppResult<List<MeetingSlot>>

    /** 409 when the slot was taken meanwhile. */
    suspend fun book(slotId: String, studentId: String, agenda: String): AppResult<Meeting>

    suspend fun meetings(box: MeetingBox, studentId: String? = null): AppResult<List<Meeting>>
    suspend fun cancel(id: String, reason: String?): AppResult<Meeting>
    suspend fun complete(id: String, input: CompleteMeetingInput): AppResult<Meeting>
    suspend fun markNoShow(id: String): AppResult<Meeting>
    suspend fun followUps(): AppResult<List<FollowUp>>
    suspend fun markFollowUpDone(id: String): AppResult<Unit>
}
