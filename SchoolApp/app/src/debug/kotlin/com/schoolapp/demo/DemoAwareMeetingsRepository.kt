package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.meetings.DefaultMeetingsRepository
import com.schoolapp.core.data.meetings.MeetingsRepository
import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.meeting.CompleteMeetingInput
import com.schoolapp.core.model.meeting.FollowUp
import com.schoolapp.core.model.meeting.FollowUpStatus
import com.schoolapp.core.model.meeting.Meeting
import com.schoolapp.core.model.meeting.MeetingBox
import com.schoolapp.core.model.meeting.MeetingSlot
import com.schoolapp.core.model.meeting.MeetingStatus
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareMeetingsRepository @Inject constructor(
    private val real: DefaultMeetingsRepository,
    private val auth: DemoAwareAuthRepository,
) : MeetingsRepository {

    override suspend fun openSlots(from: String, to: String, staffUserId: String?): AppResult<List<MeetingSlot>> {
        if (!auth.isDemoActive) return real.openSlots(from, to, staffUserId)
        return AppResult.Success(
            DemoMeetingsData.slots.value.filter {
                it.status == DemoMeetingsData.OPEN && DemoDates.inRange(it.date, from, to) && (staffUserId == null || it.staff?.id == staffUserId)
            },
        )
    }

    override suspend fun book(slotId: String, studentId: String, agenda: String): AppResult<Meeting> {
        if (!auth.isDemoActive) return real.book(slotId, studentId, agenda)
        val slot = DemoMeetingsData.slots.value.firstOrNull { it.id == slotId }
            ?: return AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))
        if (slot.status != DemoMeetingsData.OPEN) return AppResult.Failure(AppError.Server(409, "SLOT_TAKEN", "This slot was just booked by someone else."))
        val student = DemoPeopleData.students.firstOrNull { it.id == studentId }?.let { PersonRef(it.id, it.name) }
        val meeting = Meeting(
            "demo-mt-${System.currentTimeMillis()}", student, DemoActors.parent, slot.staff, slot.date, slot.startTime, slot.endTime,
            slot.mode, slot.location, agenda, MeetingStatus.SCHEDULED, notes = null, summary = null, followUps = emptyList(),
        )
        setSlotStatus(slot.id, DemoMeetingsData.BOOKED)
        DemoMeetingsData.meetings.update { it + meeting }
        return AppResult.Success(meeting)
    }

    override suspend fun meetings(box: MeetingBox, studentId: String?): AppResult<List<Meeting>> =
        if (auth.isDemoActive) AppResult.Success(demoMeetings(box, studentId)) else real.meetings(box, studentId)

    override suspend fun cancel(id: String, reason: String?): AppResult<Meeting> {
        if (!auth.isDemoActive) return real.cancel(id, reason)
        val meeting = DemoMeetingsData.meetings.value.firstOrNull { it.id == id }
        DemoMeetingsData.slots.value.firstOrNull { it.date == meeting?.date && it.startTime == meeting?.startTime }
            ?.let { setSlotStatus(it.id, DemoMeetingsData.OPEN) }
        return change(id) { it.copy(status = MeetingStatus.CANCELLED) }
    }

    override suspend fun complete(id: String, input: CompleteMeetingInput): AppResult<Meeting> {
        if (!auth.isDemoActive) return real.complete(id, input)
        val owner = DemoActors.forRole(auth.demoSession.value?.activeRole).name
        return change(id) { meeting ->
            meeting.copy(
                status = MeetingStatus.COMPLETED,
                notes = input.notes,
                summary = if (input.shareSummaryWithParent) input.summary else null,
                followUps = input.followUps.mapIndexed { index, f ->
                    FollowUp("demo-fu-$id-$index", f.title, owner, f.dueDate, FollowUpStatus.OPEN, meeting.student?.name)
                },
            )
        }
    }

    override suspend fun markNoShow(id: String): AppResult<Meeting> =
        if (auth.isDemoActive) change(id) { it.copy(status = MeetingStatus.NO_SHOW) } else real.markNoShow(id)

    override suspend fun followUps(): AppResult<List<FollowUp>> {
        if (!auth.isDemoActive) return real.followUps()
        return AppResult.Success(DemoMeetingsData.meetings.value.flatMap { it.followUps }.sortedWith(compareBy({ it.status }, { it.dueDate })))
    }

    override suspend fun markFollowUpDone(id: String): AppResult<Unit> {
        if (!auth.isDemoActive) return real.markFollowUpDone(id)
        DemoMeetingsData.meetings.update { list ->
            list.map { m -> m.copy(followUps = m.followUps.map { if (it.id == id) it.copy(status = FollowUpStatus.DONE) else it }) }
        }
        return AppResult.Success(Unit)
    }

    private fun setSlotStatus(slotId: String, status: String) =
        DemoMeetingsData.slots.update { list -> list.map { if (it.id == slotId) it.copy(status = status) else it } }

    private fun change(id: String, transform: (Meeting) -> Meeting): AppResult<Meeting> {
        DemoMeetingsData.meetings.update { list -> list.map { if (it.id == id) transform(it) else it } }
        return DemoMeetingsData.meetings.value.firstOrNull { it.id == id }?.let { AppResult.Success(it) }
            ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))
    }

    internal companion object {
        fun demoMeetings(box: MeetingBox, studentId: String?): List<Meeting> {
            val today = DemoDates.todayKey()
            return DemoMeetingsData.meetings.value
                .filter { studentId == null || it.student?.id == studentId }
                .filter { m ->
                    val upcoming = m.status == MeetingStatus.SCHEDULED && m.date >= today
                    if (box == MeetingBox.UPCOMING) upcoming else !upcoming
                }
                .let { list -> if (box == MeetingBox.UPCOMING) list.sortedBy { it.date + it.startTime } else list.sortedByDescending { it.date + it.startTime } }
        }
    }
}
