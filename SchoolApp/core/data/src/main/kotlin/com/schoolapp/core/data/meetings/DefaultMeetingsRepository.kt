package com.schoolapp.core.data.meetings

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.model.meeting.AcceptMeetingInput
import com.schoolapp.core.model.meeting.CompleteMeetingInput
import com.schoolapp.core.model.meeting.FollowUp
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.core.model.meeting.MeetingRequestInput
import com.schoolapp.core.model.meeting.MeetingSlot
import com.schoolapp.core.model.meeting.MeetingTeacher
import com.schoolapp.core.model.meeting.SlotInput
import com.schoolapp.core.model.meeting.StaffMeetingInput
import com.schoolapp.core.model.settings.PagedList
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.MeetingsApi
import com.schoolapp.core.network.dto.common.ReasonBodyDto
import com.schoolapp.core.network.dto.meeting.AcceptMeetingBodyDto
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

    override suspend fun teachers(studentId: String): AppResult<List<MeetingTeacher>> =
        apiCaller.call { api.teachers(studentId).data.map { it.toModel() } }

    override suspend fun request(input: MeetingRequestInput): AppResult<Meeting> =
        apiCaller.call { api.request(input.toBody()).data.toModel() }

    override suspend fun accept(id: String, change: AcceptMeetingInput?): AppResult<Meeting> =
        apiCaller.call { api.accept(id, change?.toBody() ?: AcceptMeetingBodyDto()).data.toModel() }

    override suspend fun schedule(input: StaffMeetingInput): AppResult<Meeting> =
        apiCaller.call { api.schedule(input.toBody()).data.toModel() }

    override suspend fun decline(id: String, reason: String?): AppResult<Meeting> =
        apiCaller.call { api.decline(id, ReasonBodyDto(reason.clean())).data.toModel() }

    override suspend fun meetings(box: MeetingBox, studentId: String?): AppResult<List<Meeting>> = apiCaller.call {
        val list = api.meetings(box.name.lowercase(), studentId).data.map { it.toModel() }.chronological()
        if (box == MeetingBox.PAST) list.reversed() else list
    }

    override suspend fun meetingsPage(box: MeetingBox, studentId: String?, page: Int, pageSize: Int): AppResult<PagedList<Meeting>> =
        apiCaller.call {
            val envelope = api.meetings(box.name.lowercase(), studentId, page, pageSize)
            val items = envelope.data.map { it.toModel() }
            PagedList(items, envelope.meta?.page ?: page, envelope.meta?.pageSize ?: pageSize, envelope.meta?.total ?: items.size)
        }

    override suspend fun meeting(id: String): AppResult<Meeting> = apiCaller.call { api.meeting(id).data.toModel() }

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
