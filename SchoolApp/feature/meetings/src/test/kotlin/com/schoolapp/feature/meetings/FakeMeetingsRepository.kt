package com.schoolapp.feature.meetings

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.meetings.MeetingsRepository
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.meeting.CompleteMeetingInput
import com.schoolapp.core.model.meeting.FollowUp
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.model.meeting.MeetingRequestInput
import com.schoolapp.core.model.meeting.MeetingSlot
import com.schoolapp.core.model.meeting.MeetingStatus
import com.schoolapp.core.model.meeting.MeetingTeacher
import com.schoolapp.core.model.meeting.SlotInput

internal fun slot(id: String, date: String = "2026-10-08", start: String = "09:00") =
    MeetingSlot(id, PersonRef("t1", "Ms Sana"), date, start, "09:20", MeetingMode.IN_PERSON, null, "OPEN")

internal fun meeting(id: String = "m1", status: MeetingStatus = MeetingStatus.SCHEDULED) = Meeting(
    id = id, student = PersonRef("c1", "Ali Khan"), guardian = PersonRef("g1", "Imran Khan"), staff = PersonRef("u1", "Sara Ali"),
    date = "2026-10-08", startTime = "09:00", endTime = "09:20", mode = MeetingMode.IN_PERSON, location = null,
    agenda = "Progress", status = status, notes = null, summary = null, followUps = emptyList(),
)

internal class FakeMeetingsRepository : MeetingsRepository {
    var slots = listOf(slot("s1"), slot("s2", start = "10:00"), slot("s3", date = "2026-10-09"))
    var bookError: AppError? = null
    val slotRequests = mutableListOf<Pair<String, String>>()
    val bookings = mutableListOf<Triple<String, String, String>>()
    val completions = mutableListOf<CompleteMeetingInput>()
    var upcoming = listOf(meeting())
    var teachers = listOf(
        MeetingTeacher("t1", "Ms Sana", listOf("Class teacher"), openSlots = 3),
        MeetingTeacher("t2", "Mr Imran", listOf("Urdu"), openSlots = 0),
    )
    var requestError: AppError? = null
    val requests = mutableListOf<MeetingRequestInput>()
    val accepted = mutableListOf<String>()
    val declined = mutableListOf<Pair<String, String?>>()

    override suspend fun teachers(studentId: String): AppResult<List<MeetingTeacher>> = AppResult.Success(teachers)

    override suspend fun request(input: MeetingRequestInput): AppResult<Meeting> {
        requestError?.let { return AppResult.Failure(it) }
        requests += input
        return AppResult.Success(meeting(status = MeetingStatus.REQUESTED))
    }

    override suspend fun accept(id: String): AppResult<Meeting> {
        accepted += id
        return AppResult.Success(meeting(id, MeetingStatus.SCHEDULED))
    }

    override suspend fun decline(id: String, reason: String?): AppResult<Meeting> {
        declined += id to reason
        return AppResult.Success(meeting(id, MeetingStatus.CANCELLED))
    }

    override suspend fun openSlots(from: String, to: String, staffUserId: String?): AppResult<List<MeetingSlot>> {
        slotRequests += from to to
        return AppResult.Success(slots)
    }

    var mine = listOf(slot("m1", date = "2026-10-06", start = "13:00"), slot("m2", date = "2026-10-08").copy(status = "BOOKED"))
    var publishError: AppError? = null
    var removeError: AppError? = null
    val mySlotRequests = mutableListOf<Triple<String, String, String>>()
    val published = mutableListOf<List<SlotInput>>()
    val removed = mutableListOf<String>()

    override suspend fun mySlots(staffUserId: String, from: String, to: String): AppResult<List<MeetingSlot>> {
        mySlotRequests += Triple(staffUserId, from, to)
        return AppResult.Success(mine)
    }

    override suspend fun publishSlots(slots: List<SlotInput>): AppResult<List<MeetingSlot>> {
        publishError?.let { return AppResult.Failure(it) }
        published += slots
        return AppResult.Success(slots.mapIndexed { i, s -> MeetingSlot("new$i", null, s.date, s.startTime, s.endTime, s.mode, s.location, "OPEN") })
    }

    override suspend fun removeSlot(id: String): AppResult<MeetingSlot> {
        removeError?.let { return AppResult.Failure(it) }
        removed += id
        mine = mine.filterNot { it.id == id }
        return AppResult.Success(slot(id).copy(status = "CANCELLED"))
    }

    override suspend fun book(slotId: String, studentId: String, agenda: String): AppResult<Meeting> {
        bookError?.let { return AppResult.Failure(it) }
        bookings += Triple(slotId, studentId, agenda)
        return AppResult.Success(meeting())
    }

    override suspend fun meetings(box: MeetingBox, studentId: String?) =
        AppResult.Success(if (box == MeetingBox.UPCOMING) upcoming else emptyList())

    override suspend fun cancel(id: String, reason: String?) = AppResult.Success(meeting(id, MeetingStatus.CANCELLED))

    override suspend fun complete(id: String, input: CompleteMeetingInput): AppResult<Meeting> {
        completions += input
        return AppResult.Success(meeting(id, MeetingStatus.COMPLETED).copy(notes = input.notes))
    }

    override suspend fun markNoShow(id: String) = AppResult.Success(meeting(id, MeetingStatus.NO_SHOW))
    override suspend fun followUps(): AppResult<List<FollowUp>> = AppResult.Success(emptyList())
    override suspend fun markFollowUpDone(id: String): AppResult<Unit> = AppResult.Success(Unit)
}
