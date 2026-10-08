package com.schoolapp.feature.diary

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.diary.DiaryRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.data.timetable.TimetableRepository
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.diary.DiaryInput
import com.schoolapp.core.model.diary.DiaryOutcome
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.model.diary.MissingDiary
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.model.files.UploadedFile
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import kotlinx.coroutines.flow.MutableStateFlow

internal fun entry(
    id: String,
    date: String,
    status: DiaryStatus = DiaryStatus.PUBLISHED,
    subjectId: String = "math",
    subjectName: String = "Maths",
) = DiaryEntry(
    id = id, sectionId = "s1", className = "Class 5", sectionName = "A", subjectId = subjectId, subjectName = subjectName,
    date = date, topics = "Fractions", homework = null, dueDate = null, attachments = emptyList(), status = status,
    revision = 1, authorName = "Sara Ali", onBehalfOfName = null, comment = null, publishedAt = null,
)

internal class FakeDiaryRepository : DiaryRepository {
    val queued = MutableStateFlow<Set<String>>(emptySet())
    var entries: List<DiaryEntry> = emptyList()
    var outcome: DiaryOutcome = DiaryOutcome.Queued
    var nextError: AppError? = null
    val publishCalls = mutableListOf<Pair<DiaryInput, String>>()
    val draftCalls = mutableListOf<Pair<DiaryInput, String>>()
    val entryQueries = mutableListOf<Triple<String?, String?, String?>>()

    override val queuedSlots = queued

    override suspend fun entries(sectionId: String?, date: String?, from: String?, to: String?): AppResult<List<DiaryEntry>> {
        entryQueries += Triple(sectionId, from, to)
        return AppResult.Success(entries)
    }

    override suspend fun saveDraft(input: DiaryInput, clientRequestId: String): AppResult<DiaryOutcome> {
        draftCalls += input to clientRequestId
        return result()
    }

    override suspend fun publish(input: DiaryInput, entryId: String?, clientRequestId: String): AppResult<DiaryOutcome> {
        publishCalls += input to clientRequestId
        return result()
    }

    override suspend fun returnEntry(id: String, comment: String): AppResult<DiaryEntry> =
        AppResult.Success(entries.first { it.id == id }.copy(status = DiaryStatus.RETURNED, comment = comment))

    override suspend fun missing(branchId: String?, date: String): AppResult<List<MissingDiary>> = AppResult.Success(emptyList())

    private fun result(): AppResult<DiaryOutcome> {
        nextError?.let {
            nextError = null
            return AppResult.Failure(it)
        }
        return AppResult.Success(outcome)
    }
}

internal class FakeFilesRepository : FilesRepository {
    var error: AppError? = null
    override suspend fun upload(uri: String, purpose: FilePurpose): AppResult<UploadedFile> =
        error?.let { AppResult.Failure(it) } ?: AppResult.Success(UploadedFile("f1", "https://files/f1", "image/png", 10, "photo.png"))
}

internal class FakeTimetableRepository(private val slots: List<TeacherSlot> = emptyList()) : TimetableRepository {
    override suspend fun myWeek(weekOf: String?, studentId: String?): AppResult<List<TeacherSlot>> = AppResult.Success(slots)
    override suspend fun sectionTimetable(sectionId: String): AppResult<SectionTimetable> = AppResult.Failure(AppError.Network)

    override suspend fun overrides(branchId: String, date: String): AppResult<List<com.schoolapp.core.model.timetable.TimetableOverride>> =
        AppResult.Success(emptyList())

    override suspend fun assignSubstitute(
        input: com.schoolapp.core.model.timetable.OverrideInput,
    ): AppResult<com.schoolapp.core.model.timetable.TimetableOverride> = AppResult.Failure(AppError.Network)

    override suspend fun removeOverride(id: String): AppResult<Unit> = AppResult.Failure(AppError.Network)
}

internal class FakeOrganisationRepository(
    private val sections: List<Section> = listOf(Section("s1", "c5", "Class 5", "A", 30, null, 20, "ACTIVE")),
    private val subjects: List<Subject> = listOf(Subject("math", "M", "Maths"), Subject("eng", "E", "English")),
) : OrganisationRepository {
    override suspend fun branches(): AppResult<List<Branch>> = AppResult.Success(emptyList())
    override suspend fun branchOverview(branchId: String): AppResult<BranchOverview> = AppResult.Failure(AppError.Network)
    override suspend fun sessions(branchId: String): AppResult<List<AcademicSession>> = AppResult.Success(emptyList())
    override suspend fun calendar(branchId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> = AppResult.Success(emptyList())
    override suspend fun classes(schoolId: String?): AppResult<List<SchoolClass>> = AppResult.Success(emptyList())
    override suspend fun sections(branchId: String, sessionId: String?): AppResult<List<Section>> = AppResult.Success(sections)
    override suspend fun subjects(schoolId: String?): AppResult<List<Subject>> = AppResult.Success(subjects)
}

internal class FakeStudentsRepository(private val sectionId: String?) : StudentsRepository {
    override suspend fun students(sectionId: String?, search: String?): AppResult<List<StudentSummary>> = AppResult.Success(emptyList())
    override suspend fun student(id: String): AppResult<StudentDetail> = AppResult.Success(
        StudentDetail(
            summary = StudentSummary(id, null, "Ali", null, null, null, "Class 5", "A", sectionId, 1, "ACTIVE", null, null),
            branchName = null, bForm = null, address = null, admissionDate = null, enrollment = null,
            guardians = emptyList(), documents = emptyList(),
        ),
    )
}
