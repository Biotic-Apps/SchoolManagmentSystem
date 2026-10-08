package com.schoolapp.feature.timetable

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.academics.AcademicsEvents
import com.schoolapp.core.data.academics.CatalogueRepository
import com.schoolapp.core.data.academics.TeacherAllocationRepository
import com.schoolapp.core.data.organisation.ClassesOverviewRepository
import com.schoolapp.core.data.timetable.TimetableBuilderRepository
import com.schoolapp.core.model.academics.CatalogueSubject
import com.schoolapp.core.model.academics.NamedRef
import com.schoolapp.core.model.academics.Room
import com.schoolapp.core.model.academics.TeachingStaff
import com.schoolapp.core.model.organisation.ClassOverview
import com.schoolapp.core.model.organisation.SectionOverview
import com.schoolapp.core.model.timetable.BellSchedule
import com.schoolapp.core.model.timetable.BellScheduleInput
import com.schoolapp.core.model.timetable.BuilderLesson
import com.schoolapp.core.model.timetable.BusyEntry
import com.schoolapp.core.model.timetable.Conflict
import com.schoolapp.core.model.timetable.ConflictSeverity
import com.schoolapp.core.model.timetable.LessonInput
import com.schoolapp.core.model.timetable.LessonSaveResult
import com.schoolapp.core.model.timetable.Period
import com.schoolapp.core.model.timetable.TimetableBuilder
import com.schoolapp.core.model.timetable.TimetableDraft
import com.schoolapp.core.model.timetable.TimetableState
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.feature.timetable.builder.TimetableBuilderViewModel

internal val english = NamedRef("eng", "English")
internal val sana = NamedRef("t1", "Ms Sana")

internal fun builder(canEdit: Boolean = true, state: TimetableState = TimetableState.EMPTY) = TimetableBuilder(
    draft = TimetableDraft(
        sessionId = "se1", state = state, version = 0, publishedAt = null, canEdit = canEdit,
        canPublish = false, publishBlockedReason = "Add at least one lesson first", slots = emptyList(),
        periods = (1..4).map { Period(it, "08:00", "08:40", isBreak = it == 3, label = null, number = if (it < 3) it else it - 1) },
        dayPeriods = emptyMap(), workingDays = listOf(1, 2, 3, 4, 5),
    ),
    sectionId = "sA", sectionName = "A", sectionGroup = null, className = "Class 1", branchId = "b1",
    lessons = listOf(BuilderLesson(english, 6, 0, sana), BuilderLesson(NamedRef("urd", "Urdu"), 6, 0, null)),
    rooms = listOf(NamedRef("r1", "Room 101")),
    busy = listOf(BusyEntry("t2", null, 1, 1, "Class 5 A", true)),
    conflicts = emptyList(),
)

internal class FakeBuilderRepository : TimetableBuilderRepository {
    var current = builder()
    var failWith: AppError? = null
    val saved = mutableListOf<Triple<Int, Int, LessonInput>>()
    val removed = mutableListOf<Pair<Int, Int>>()
    var published = 0
    var bellSaves = mutableListOf<BellScheduleInput>()
    var bellFailures = mutableListOf<AppError>()

    override suspend fun builder(sectionId: String): AppResult<TimetableBuilder> = AppResult.Success(current)
    override suspend fun saveLesson(sectionId: String, day: Int, periodIndex: Int, input: LessonInput): AppResult<LessonSaveResult> {
        saved += Triple(day, periodIndex, input)
        failWith?.let { return AppResult.Failure(it) }
        val warning = Conflict("WEEKLY_PERIODS_SHORT", ConflictSeverity.WARNING, day, periodIndex, "Only 1 of 6")
        return AppResult.Success(LessonSaveResult(listOf(warning), input.subjectId, 1, TimetableState.DRAFT, true, null, input.allocate))
    }
    override suspend fun removeLesson(sectionId: String, day: Int, periodIndex: Int): AppResult<LessonSaveResult> {
        removed += day to periodIndex
        return failWith?.let { AppResult.Failure(it) }
            ?: AppResult.Success(LessonSaveResult(emptyList(), null, null, TimetableState.EMPTY, false, "Add at least one lesson first", false))
    }
    override suspend fun publish(sectionId: String): AppResult<Unit> {
        published++
        return failWith?.let { AppResult.Failure(it) } ?: AppResult.Success(Unit)
    }
    override suspend fun discard(sectionId: String): AppResult<Unit> = AppResult.Success(Unit)
    override suspend fun saveBellSchedule(branchId: String, input: BellScheduleInput): AppResult<BellSchedule> {
        bellSaves += input
        bellFailures.removeFirstOrNull()?.let { return AppResult.Failure(it) }
        return AppResult.Success(BellSchedule(listOf(1, 2, 3, 4, 5), input.default.map { Period(it.index, it.startTime, it.endTime, it.isBreak, it.label) }))
    }
}

internal class FakeOverview : ClassesOverviewRepository {
    override suspend fun overview(branchId: String, schoolId: String?, sessionId: String?): AppResult<List<ClassOverview>> = AppResult.Success(
        listOf(
            ClassOverview(
                "c1", "Class 1", 1, "ACTIVE", 0, null,
                listOf(SectionOverview("sA", "A", null, 0, 30, null, null, TimetableState.EMPTY), SectionOverview("sB", "B", "Arts", 0, 30, null, null, null)),
                emptyList(), issues = emptyList(), unallocated = 0,
            ),
        ),
    )
}

internal class FakeTeaching : TeacherAllocationRepository {
    override suspend fun teachingStaff(branchId: String, sessionId: String?): AppResult<List<TeachingStaff>> =
        AppResult.Success(listOf(TeachingStaff("t1", "Ms Sana", null, true, 6, 2, 1), TeachingStaff("t2", "Mr Ali", null, true, 0, 0, 0)))
    override suspend fun setClassTeacher(sectionId: String, staffId: String?): AppResult<Unit> = AppResult.Success(Unit)
    override suspend fun setSubjectTeacher(sectionId: String, subjectId: String, staffId: String?): AppResult<Unit> = AppResult.Success(Unit)
}

internal class FakeRooms : CatalogueRepository {
    override suspend fun subjects(schoolId: String?): AppResult<List<CatalogueSubject>> = AppResult.Success(emptyList())
    override suspend fun createSubject(schoolId: String, name: String, classIds: List<String>, periodsPerWeek: Int?) =
        AppResult.Success(CatalogueSubject("x", null, name))
    override suspend fun renameSubject(subjectId: String, name: String) = AppResult.Success(CatalogueSubject(subjectId, null, name))
    override suspend fun rooms(branchId: String): AppResult<List<Room>> = AppResult.Success(emptyList())
    override suspend fun createRoom(branchId: String, name: String, capacity: Int?) = AppResult.Success(Room("new-room", name, capacity))
    override suspend fun updateRoom(roomId: String, name: String, capacity: Int?) = AppResult.Success(Room(roomId, name, capacity))
}

internal fun builderViewModel(auth: FakeAuthRepository, repository: FakeBuilderRepository, sectionId: String? = null) =
    TimetableBuilderViewModel(
        SavedStateHandle(listOfNotNull(sectionId?.let { "sectionId" to it }).toMap()),
        repository, FakeOverview(), OrgAnswers().repository, FakeTeaching(), FakeRooms(), auth, AcademicsEvents(),
    )
