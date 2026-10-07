package com.schoolapp.core.data.meetings

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.model.meeting.CompleteMeetingInput
import com.schoolapp.core.model.meeting.FollowUp
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.core.model.meeting.MeetingSlot
import com.schoolapp.core.model.meeting.SlotInput
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.MeetingsApi
import com.schoolapp.core.network.dto.common.ReasonBodyDto
import com.schoolapp.core.network.dto.meeting.BookMeetingBodyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultMeetingsRepository @Inject constructor(
    private val api: MeetingsApi,
    private val apiCaller: ApiCaller,
) : MeetingsRepository {

    override suspend fun openSlots(from: String, to: String, staffUserId: String?): AppResult<List<MeetingSlot>> =
        apiCaller.call {
            api.slots(staffUserId, from, to).data.map { it.toModel() }
                .filter { it.status == null || it.status == OPEN }
                .sortedWith(compareBy({ it.date }, { it.startTime }))
        }

    override suspend fun mySlots(staffUserId: String, from: String, to: String): AppResult<List<MeetingSlot>> =
        apiCaller.call { api.slots(staffUserId, from, to).data.toOwnSlots() }

    override suspend fun publishSlots(slots: List<SlotInput>): AppResult<List<MeetingSlot>> =
        apiCaller.call { api.createSlots(slots.toCreateBody()).data.map { it.toModel() } }

    override suspend fun removeSlot(id: String): AppResult<MeetingSlot> =
        apiCaller.call { api.deleteSlot(id).data.toModel() }

    override suspend fun book(slotId: String, studentId: String, agenda: String): AppResult<Meeting> =
        apiCaller.call { api.book(BookMeetingBodyDto(slotId, studentId, agenda.trim())).data.toModel() }

    override suspend fun meetings(box: MeetingBox, studentId: String?): AppResult<List<Meeting>> = apiCaller.call {
        val list = api.meetings(box.name.lowercase(), studentId).data.map { it.toModel() }.chronological()
        if (box == MeetingBox.PAST) list.reversed() else list
    }

    override suspend fun cancel(id: String, reason: String?): AppResult<Meeting> =
        apiCaller.call { api.cancel(id, ReasonBodyDto(reason.clean())).data.toModel() }

    override suspend fun complete(id: String, input: CompleteMeetingInput): AppResult<Meeting> =
        apiCaller.call { api.complete(id, input.toBody()).data.toModel() }

    override suspend fun markNoShow(id: String): AppResult<Meeting> =
        apiCaller.call { api.noShow(id, ReasonBodyDto()).data.toModel() }

    override suspend fun followUps(): AppResult<List<FollowUp>> =
        apiCaller.call { api.followUps().data.map { it.toModel() }.sortedBy { it.dueDate.orEmpty() } }

    override suspend fun markFollowUpDone(id: String): AppResult<Unit> = apiCaller.call { api.markFollowUpDone(id) }

    private companion object {
        const val OPEN = "OPEN"
    }
}
