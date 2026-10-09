package com.schoolapp.core.data.meetings

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.meeting.CompleteMeetingInput
import com.schoolapp.core.model.meeting.FollowUp
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.core.model.meeting.MeetingRequestInput
import com.schoolapp.core.model.meeting.MeetingSlot
import com.schoolapp.core.model.meeting.MeetingTeacher
import com.schoolapp.core.model.meeting.SlotInput

interface MeetingsRepository {
    /** Open slots the caller may book (server-scoped to the child's teachers for parents). */
    suspend fun openSlots(from: String, to: String, staffUserId: String? = null): AppResult<List<MeetingSlot>>

    /** [staffUserId]'s own OPEN and BOOKED slots between [from] and [to], chronological. */
    suspend fun mySlots(staffUserId: String, from: String, to: String): AppResult<List<MeetingSlot>>

    /** Publishes every slot in one request; 409 when one overlaps another or an existing slot. */
    suspend fun publishSlots(slots: List<SlotInput>): AppResult<List<MeetingSlot>>

    /** Withdraws an OPEN slot; 409 once a parent has booked it. */
    suspend fun removeSlot(id: String): AppResult<MeetingSlot>

    /** 409 when the slot was taken meanwhile. */
    suspend fun book(slotId: String, studentId: String, agenda: String): AppResult<Meeting>

    /** The child's teachers and principal, even those without open slots. */
    suspend fun teachers(studentId: String): AppResult<List<MeetingTeacher>>

    /** Parent suggests a time to a teacher; 409 while an earlier request to them is unanswered. */
    suspend fun request(input: MeetingRequestInput): AppResult<Meeting>

    /** Staff confirm a parent's request at the suggested time. */
    suspend fun accept(id: String): AppResult<Meeting>

    suspend fun decline(id: String, reason: String?): AppResult<Meeting>

    suspend fun meetings(box: MeetingBox, studentId: String? = null): AppResult<List<Meeting>>
    suspend fun cancel(id: String, reason: String?): AppResult<Meeting>
    suspend fun complete(id: String, input: CompleteMeetingInput): AppResult<Meeting>
    suspend fun markNoShow(id: String): AppResult<Meeting>
    suspend fun followUps(): AppResult<List<FollowUp>>
    suspend fun markFollowUpDone(id: String): AppResult<Unit>
}
