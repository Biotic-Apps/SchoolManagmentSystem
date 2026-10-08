package com.schoolapp.feature.organisation

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.academics.AcademicsEvents
import com.schoolapp.core.data.academics.CatalogueRepository
import com.schoolapp.core.data.academics.ClassStructureRepository
import com.schoolapp.core.data.academics.TeacherAllocationRepository
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.timetable.BellScheduleRepository
import com.schoolapp.core.model.academics.CatalogueSubject
import com.schoolapp.core.model.academics.ClassSetup
import com.schoolapp.core.model.academics.ClassSubject
import com.schoolapp.core.model.academics.ClassSubjectInput
import com.schoolapp.core.model.academics.NewSection
import com.schoolapp.core.model.academics.Room
import com.schoolapp.core.model.academics.SectionChange
import com.schoolapp.core.model.academics.SetupSection
import com.schoolapp.core.model.academics.TeachingStaff
import com.schoolapp.core.model.timetable.BellSchedule
import com.schoolapp.core.model.timetable.Period
import com.schoolapp.feature.organisation.classes.ClassesViewModel
import com.schoolapp.feature.organisation.scope.BranchOptionsLoader

fun conflict(code: String, message: String, details: String? = null) = AppError.Server(409, code, message, details)

fun subject(id: String, name: String = id.uppercase(), periods: Int? = null, group: String? = null) =
    ClassSubject(id, id.uppercase(), name, periods, false, group)

fun section(id: String, name: String, group: String? = null, students: Int = 0) =
    SetupSection(id, name, group, students, 40, null, null, null)

fun classSetup(
    sections: List<SetupSection> = listOf(section("sA", "A")),
    subjects: List<ClassSubject> = listOf(subject("eng", "English", 6), subject("urd", "Urdu", 6)),
    canEdit: Boolean = true,
    canAllocate: Boolean = true,
) = ClassSetup("c1", "Class 1", 1, "b1", "se1", sections, subjects, emptyList(), emptyList(), canEdit, canAllocate)

class FakeClassStructureRepository : ClassStructureRepository {
    var setup = classSetup()
    var failWith: AppError? = null
    val created = mutableListOf<Triple<String, String, Int>>()
    val orders = mutableListOf<List<String>>()
    val subjectSaves = mutableListOf<List<ClassSubjectInput>>()
    val sectionChanges = mutableListOf<Pair<String, SectionChange>>()
    val addedSections = mutableListOf<NewSection>()
    val archived = mutableListOf<String>()
    var nameOf: (String) -> String = { it }

    private fun <T> answer(value: () -> T): AppResult<T> = failWith?.let { AppResult.Failure(it) } ?: AppResult.Success(value())

    override suspend fun createClass(schoolId: String, name: String, levelOrder: Int) = answer {
        created += Triple(schoolId, name, levelOrder)
        "new-class"
    }
    override suspend fun renameClass(classId: String, name: String) = answer { setup = setup.copy(className = name) }
    override suspend fun reorderClasses(classIds: List<String>) = answer { orders += classIds }
    override suspend fun classSetup(classId: String, branchId: String, sessionId: String?): AppResult<ClassSetup> = AppResult.Success(setup)
    override suspend fun setClassSubjects(classId: String, items: List<ClassSubjectInput>): AppResult<List<ClassSubject>> {
        subjectSaves += items
        failWith?.let { return AppResult.Failure(it) }
        val saved = items.map { item ->
            (setup.subjects.firstOrNull { it.subjectId == item.subjectId } ?: ClassSubject(item.subjectId, null, nameOf(item.subjectId), null, false, null)).copy(periodsPerWeek = item.periodsPerWeek, isOptional = item.isOptional, group = item.group)
        }
        setup = setup.copy(subjects = saved)
        return AppResult.Success(saved)
    }
    override suspend fun addSection(section: NewSection) = answer {
        addedSections += section
        setup = setup.copy(sections = setup.sections + section(section.name, section.name))
    }
    override suspend fun updateSection(sectionId: String, change: SectionChange) = answer { sectionChanges += sectionId to change }
    override suspend fun archiveSection(sectionId: String) = answer { archived += sectionId }
}

class FakeTeacherAllocationRepository : TeacherAllocationRepository {
    val subjectTeachers = mutableListOf<Triple<String, String, String?>>()
    val classTeachers = mutableListOf<Pair<String, String?>>()
    var failWith: AppError? = null
    override suspend fun teachingStaff(branchId: String, sessionId: String?): AppResult<List<TeachingStaff>> =
        AppResult.Success(listOf(TeachingStaff("t1", "Ms Sana", "TEACHER", true, 6, 4, 1), TeachingStaff("t2", "Mr Ali", "TEACHER", true, 0, 0, 0)))
    override suspend fun setClassTeacher(sectionId: String, staffId: String?): AppResult<Unit> {
        classTeachers += sectionId to staffId
        return failWith?.let { AppResult.Failure(it) } ?: AppResult.Success(Unit)
    }
    override suspend fun setSubjectTeacher(sectionId: String, subjectId: String, staffId: String?): AppResult<Unit> {
        subjectTeachers += Triple(sectionId, subjectId, staffId)
        return failWith?.let { AppResult.Failure(it) } ?: AppResult.Success(Unit)
    }
}

class FakeCatalogueRepository : CatalogueRepository {
    var subjects = listOf(CatalogueSubject("eng", "ENG", "English"), CatalogueSubject("urd", "URDU", "Urdu"), CatalogueSubject("isl", "ISL", "Islamiat"))
    var rooms = listOf(Room("r1", "Room 101", 35))
    var failWith: AppError? = null
    val createdSubjects = mutableListOf<Pair<String, List<String>>>()
    val createdRooms = mutableListOf<String>()
    val renamed = mutableListOf<Pair<String, String>>()

    private fun <T> answer(value: () -> T): AppResult<T> = failWith?.let { AppResult.Failure(it) } ?: AppResult.Success(value())

    override suspend fun subjects(schoolId: String?) = answer { subjects }
    override suspend fun createSubject(schoolId: String, name: String, classIds: List<String>, periodsPerWeek: Int?) = answer {
        createdSubjects += name to classIds
        CatalogueSubject("new-" + name.lowercase(), null, name).also { subjects = subjects + it }
    }
    override suspend fun renameSubject(subjectId: String, name: String) = answer {
        renamed += subjectId to name
        CatalogueSubject(subjectId, null, name)
    }
    override suspend fun rooms(branchId: String) = answer { rooms }
    override suspend fun createRoom(branchId: String, name: String, capacity: Int?) = answer {
        createdRooms += name
        Room("room-" + name, name, capacity).also { rooms = rooms + it }
    }
    override suspend fun updateRoom(roomId: String, name: String, capacity: Int?) = answer {
        renamed += roomId to name
        Room(roomId, name, capacity)
    }
}

class FakeBellRepository : BellScheduleRepository {
    override suspend fun schedule(branchId: String): AppResult<BellSchedule> = AppResult.Success(
        BellSchedule(listOf(1, 2, 3, 4, 5), (1..6).map { Period(it, "08:00", "08:40", isBreak = it == 4, label = null) }),
    )
}

fun classesViewModel(
    auth: AuthRepository,
    repository: FakeOrganisationRepository = FakeOrganisationRepository(),
    structure: ClassStructureRepository = FakeClassStructureRepository(),
    handle: SavedStateHandle = SavedStateHandle(),
) = ClassesViewModel(
    BranchOptionsLoader(auth, repository),
    repository,
    FakeClassesOverviewRepository(repository),
    structure,
    auth,
    AcademicsEvents(),
    handle,
)
