package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.diary.DefaultDiaryRepository
import com.schoolapp.core.data.diary.DiaryRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.diary.DiaryInput
import com.schoolapp.core.model.diary.DiaryOutcome
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.model.diary.MissingDiary
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareDiaryRepository @Inject constructor(
    private val real: DefaultDiaryRepository,
    private val auth: DemoAwareAuthRepository,
) : DiaryRepository {

    @OptIn(ExperimentalCoroutinesApi::class)
    override val queuedSlots: Flow<Set<String>> =
        auth.demoActive.flatMapLatest { demo -> if (demo) flowOf(emptySet()) else real.queuedSlots }

    override suspend fun entries(sectionId: String?, date: String?, from: String?, to: String?): AppResult<List<DiaryEntry>> {
        if (!auth.isDemoActive) return real.entries(sectionId, date, from, to)
        val session = auth.demoSession.value
        val parentSection = session?.activeChild?.id?.let { childId -> DemoPeopleData.students.firstOrNull { it.id == childId }?.sectionId }
        val list = DemoDiaryData.entries.value.filter { entry ->
            val inScope = when (session?.activeRole) {
                RoleKey.PARENT -> entry.status == DiaryStatus.PUBLISHED && entry.sectionId == (sectionId ?: parentSection)
                else -> sectionId == null || entry.sectionId == sectionId
            }
            inScope && (date == null || entry.date == date) && DemoDates.inRange(entry.date, from, to)
        }
        return AppResult.Success(list.sortedWith(compareByDescending<DiaryEntry> { it.date }.thenBy { it.subjectName }))
    }

    override suspend fun saveDraft(input: DiaryInput, clientRequestId: String): AppResult<DiaryOutcome> {
        if (!auth.isDemoActive) return real.saveDraft(input, clientRequestId)
        return AppResult.Success(DiaryOutcome.Saved(upsert(input, null, publish = false)))
    }

    override suspend fun publish(input: DiaryInput, entryId: String?, clientRequestId: String): AppResult<DiaryOutcome> {
        if (!auth.isDemoActive) return real.publish(input, entryId, clientRequestId)
        if (auth.demoSession.value?.activeRole == RoleKey.HELPER) return AppResult.Failure(AppError.Forbidden("FORBIDDEN"))
        return AppResult.Success(DiaryOutcome.Saved(upsert(input, entryId, publish = true)))
    }

    override suspend fun returnEntry(id: String, comment: String): AppResult<DiaryEntry> {
        if (!auth.isDemoActive) return real.returnEntry(id, comment)
        DemoDiaryData.entries.update { list -> list.map { if (it.id == id) it.copy(status = DiaryStatus.RETURNED, comment = comment) else it } }
        return DemoDiaryData.entries.value.firstOrNull { it.id == id }?.let { AppResult.Success(it) }
            ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))
    }

    override suspend fun missing(branchId: String?, date: String): AppResult<List<MissingDiary>> =
        if (auth.isDemoActive) AppResult.Success(demoMissing(date)) else real.missing(branchId, date)

    private fun upsert(input: DiaryInput, entryId: String?, publish: Boolean): DiaryEntry {
        val role = auth.demoSession.value?.activeRole
        val me = DemoActors.forRole(role)
        val existing = DemoDiaryData.entries.value.firstOrNull { (entryId != null && it.id == entryId) || it.slotKey == input.slotKey }
        val wasPublished = existing?.status == DiaryStatus.PUBLISHED
        val base = existing ?: DemoDiaryData.entry(
            "demo-dy-${System.currentTimeMillis()}", input.sectionId, input.subjectId, input.date, input.topics, null,
            DiaryStatus.DRAFT, me.name,
        )
        val saved = base.copy(
            topics = input.topics,
            homework = input.homework,
            dueDate = input.dueDate,
            attachments = DemoFiles.attachments(input.attachmentFileIds),
            status = if (publish || wasPublished) DiaryStatus.PUBLISHED else DiaryStatus.DRAFT,
            revision = if (existing == null) 1 else existing.revision + 1,
            authorName = me.name,
            onBehalfOfName = if (role == RoleKey.HELPER || role != RoleKey.TEACHER && publish) DemoActors.teacher.name else null,
            comment = null,
            publishedAt = if (publish) DemoDates.isoNow() else existing?.publishedAt,
        )
        DemoDiaryData.entries.update { list -> list.filterNot { it.id == saved.id } + saved }
        return saved
    }

    internal companion object {
        /** Maths and English for every section on [date] without a published entry. */
        fun demoMissing(date: String): List<MissingDiary> = DemoPeopleData.sections.flatMap { section ->
            listOf(DemoDiaryData.MATHS, DemoDiaryData.ENGLISH).mapNotNull { subjectId ->
                val published = DemoDiaryData.entries.value.any {
                    it.sectionId == section.id && it.subjectId == subjectId && it.date == date && it.status == DiaryStatus.PUBLISHED
                }
                if (published) null else MissingDiary(section.id, section.className, section.name, subjectId, DemoDiaryData.subjectName(subjectId))
            }
        }
    }
}
