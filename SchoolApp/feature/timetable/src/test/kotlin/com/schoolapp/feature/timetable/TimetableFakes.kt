package com.schoolapp.feature.timetable

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.calendar.StudentCalendarRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.data.timetable.BellScheduleRepository
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.timetable.BellSchedule
import com.schoolapp.core.model.timetable.Period
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.testing.FakeAuthRepository
import java.lang.reflect.Proxy
import java.time.LocalDateTime

/** Mon–Sat, P1 08:00, P2 08:40, break 09:20, P3 09:40; Friday is shorter. */
internal object Bell {
    val default = listOf(
        Period(1, "08:00", "08:40", false, null, 1),
        Period(2, "08:40", "09:20", false, null, 2),
        Period(3, "09:20", "09:40", true, "Break", null),
        Period(4, "09:40", "10:20", false, null, 3),
    )
    val friday = listOf(
        Period(1, "08:00", "08:35", false, null, 1),
        Period(2, "08:35", "09:10", false, null, 2),
    )
    val schedule = BellSchedule((1..6).toList(), default, mapOf(5 to friday))
}

internal fun teacherSlot(day: Int, index: Int, start: String, end: String, number: Int? = index, sub: Boolean = false) =
    TeacherSlot(null, day, index, start, end, "A", "Class 5", "Mathematics", "Demo Teacher", "Room 12", sub, number)

internal class FakeTimetables : TimetableRepository {
    var week: List<TeacherSlot> = emptyList()
    var sections: Map<String, SectionTimetable> = emptyMap()
    var failure: AppError? = null
    val studentIds = mutableListOf<String?>()
    val weeksOf = mutableListOf<String?>()

    override suspend fun myWeek(weekOf: String?, studentId: String?): AppResult<List<TeacherSlot>> {
        studentIds += studentId
        weeksOf += weekOf
        return failure?.let { AppResult.Failure(it) } ?: AppResult.Success(week)
    }

    override suspend fun sectionTimetable(sectionId: String): AppResult<SectionTimetable> =
        failure?.let { AppResult.Failure(it) }
            ?: sections[sectionId]?.let { AppResult.Success(it) }
            ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))
}

internal class FakeBell(var schedule: BellSchedule? = Bell.schedule) : BellScheduleRepository {
    override suspend fun schedule(branchId: String): AppResult<BellSchedule> =
        schedule?.let { AppResult.Success(it) } ?: AppResult.Failure(AppError.Network)
}

internal class FakeStudentCalendar(var events: List<CalendarEvent> = emptyList()) : StudentCalendarRepository {
    override suspend fun upcoming(studentId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> = AppResult.Success(events)
}

/** Answers what the timetable needs from organisation data: sessions, sections and the calendar. */
internal class OrgAnswers {
    var sections: List<Section> = emptyList()
    var events: List<CalendarEvent> = emptyList()

    val repository: OrganisationRepository = Proxy.newProxyInstance(
        OrganisationRepository::class.java.classLoader, arrayOf(OrganisationRepository::class.java),
    ) { _, method, _ ->
        when (method.name) {
            "sessions" -> AppResult.Success(listOf(AcademicSession("se1", "b1", "2026-27", "2026-04-01", "2027-03-31", "ACTIVE", 3)))
            "sections" -> AppResult.Success(sections)
            "calendar" -> AppResult.Success(events)
            "branches" -> AppResult.Success(emptyList<Any>())
            else -> error("unexpected ${method.name}")
        }
    } as OrganisationRepository
}

internal fun section(id: String = "s1") = Section(id, "c5", "Class 5", "A", 30, null, 20, "ACTIVE")

internal fun clockAt(day: Int, hour: Int, minute: Int) = AppClock { LocalDateTime.of(2026, 10, 4 + day, hour, minute) }

internal fun timetableViewModel(
    auth: FakeAuthRepository,
    timetables: FakeTimetables,
    clock: AppClock,
    org: OrgAnswers = OrgAnswers(),
    bell: FakeBell = FakeBell(),
    studentCalendar: FakeStudentCalendar = FakeStudentCalendar(),
): TimetableViewModel {
    val loader = TimetableLoader(timetables, bell, ScopedSections(auth, org.repository), WeekHolidays(org.repository, studentCalendar))
    return TimetableViewModel(auth, loader, clock)
}
