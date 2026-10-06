package com.schoolapp.feature.progress

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.diary.DiaryRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.people.StudentsRepository
import com.schoolapp.core.data.progress.ProgressRepository
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.diary.DiaryInput
import com.schoolapp.core.model.diary.DiaryOutcome
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.model.diary.MissingDiary
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.model.progress.HomeworkTick
import com.schoolapp.core.model.progress.ProgressNote
import com.schoolapp.core.model.progress.ProgressNoteInput
import com.schoolapp.core.model.progress.ProgressNoteOutcome
import kotlinx.coroutines.flow.MutableStateFlow

internal fun student(id: String, name: String, roll: Int) =
    StudentSummary(id, null, name, null, null, null, "Class 5", "A", "s1", roll, "ACTIVE", null, null)

internal fun diaryEntry(id: String, date: String, homework: String?, status: DiaryStatus = DiaryStatus.PUBLISHED) = DiaryEntry(
    id = id, sectionId = "s1", className = "Class 5", sectionName = "A", subjectId = "math", subjectName = "Maths",
    date = date, topics = "Fractions", homework = homework, dueDate = null, attachments = emptyList(), status = status,
    revision = 1, authorName = "Sara Ali", onBehalfOfName = null, comment = null, publishedAt = null,
)

internal class FakeProgressRepository : ProgressRepository {
    var notes: List<ProgressNote> = emptyList()
    var outcome: ProgressNoteOutcome? = null
    val addCalls = mutableListOf<Pair<String, ProgressNoteInput>>()
    val homeworkCalls = mutableListOf<Pair<String, List<HomeworkTick>>>()
    var homeworkError: AppError? = null

    override suspend fun notes(studentId: String): AppResult<List<ProgressNote>> = AppResult.Success(notes)

    override suspend fun addNote(studentId: String, input: ProgressNoteInput): AppResult<ProgressNoteOutcome> {
        addCalls += studentId to input
        return AppResult.Success(
            outcome ?: ProgressNoteOutcome.Saved(ProgressNote("n_new", studentId, input.category, input.note, input.visibleToParent, null, null)),
        )
    }

    override suspend fun saveHomeworkStatus(diaryId: String, ticks: List<HomeworkTick>): AppResult<Unit> {
        homeworkCalls += diaryId to ticks
        return homeworkError?.let { AppResult.Failure(it) } ?: AppResult.Success(Unit)
    }
}

internal class FakeDiaryRepository(var entries: List<DiaryEntry> = emptyList()) : DiaryRepository {
    override val queuedSlots = MutableStateFlow<Set<String>>(emptySet())
    override suspend fun entries(sectionId: String?, date: String?, from: String?, to: String?): AppResult<List<DiaryEntry>> =
        AppResult.Success(entries.filter { date == null || it.date == date })
    override suspend fun saveDraft(input: DiaryInput, clientRequestId: String): AppResult<DiaryOutcome> = AppResult.Failure(AppError.Network)
    override suspend fun publish(input: DiaryInput, entryId: String?, clientRequestId: String): AppResult<DiaryOutcome> =
        AppResult.Failure(AppError.Network)
    override suspend fun returnEntry(id: String, comment: String): AppResult<DiaryEntry> = AppResult.Failure(AppError.Network)
    override suspend fun missing(branchId: String?, date: String): AppResult<List<MissingDiary>> = AppResult.Success(emptyList())
}

internal class FakeStudentsRepository(private val roster: List<StudentSummary>) : StudentsRepository {
    override suspend fun students(sectionId: String?, search: String?): AppResult<List<StudentSummary>> = AppResult.Success(roster)
    override suspend fun student(id: String): AppResult<StudentDetail> = AppResult.Failure(AppError.Network)
}

internal class FakeOrganisationRepository(
    private val sections: List<Section> = listOf(Section("s1", "c5", "Class 5", "A", 30, null, 20, "ACTIVE")),
) : OrganisationRepository {
    override suspend fun branches(): AppResult<List<Branch>> = AppResult.Success(emptyList())
    override suspend fun branchOverview(branchId: String): AppResult<BranchOverview> = AppResult.Failure(AppError.Network)
    override suspend fun sessions(branchId: String): AppResult<List<AcademicSession>> = AppResult.Success(emptyList())
    override suspend fun calendar(branchId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> = AppResult.Success(emptyList())
    override suspend fun classes(schoolId: String?): AppResult<List<SchoolClass>> = AppResult.Success(emptyList())
    override suspend fun sections(branchId: String, sessionId: String?): AppResult<List<Section>> = AppResult.Success(sections)
    override suspend fun subjects(schoolId: String?): AppResult<List<Subject>> = AppResult.Success(emptyList())
}
