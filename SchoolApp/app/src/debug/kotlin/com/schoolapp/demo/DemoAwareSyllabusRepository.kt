package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.syllabus.DefaultSyllabusRepository
import com.schoolapp.core.data.syllabus.SyllabusRepository
import com.schoolapp.core.model.syllabus.BookList
import com.schoolapp.core.model.syllabus.CoverageRow
import com.schoolapp.core.model.syllabus.ProgressOutcome
import com.schoolapp.core.model.syllabus.SyllabusPlan
import com.schoolapp.core.model.syllabus.TopicProgressUpdate
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareSyllabusRepository @Inject constructor(
    private val real: DefaultSyllabusRepository,
    private val auth: DemoAwareAuthRepository,
) : SyllabusRepository {

    override val queuedTopicIds: Flow<Set<String>> = real.queuedTopicIds

    override suspend fun plans(sectionId: String?, subjectId: String?): AppResult<List<SyllabusPlan>> {
        if (!auth.isDemoActive) return real.plans(sectionId, subjectId)
        return AppResult.Success(
            DemoSyllabusData.plans.filter { (sectionId == null || it.sectionId == sectionId) && (subjectId == null || it.subjectId == subjectId) },
        )
    }

    /** Topics of the 5-B plan behave like a probation teacher's work so "Pending review" can be previewed. */
    override suspend fun updateProgress(topicId: String, update: TopicProgressUpdate, clientRequestId: String): AppResult<ProgressOutcome> {
        if (!auth.isDemoActive) return real.updateProgress(topicId, update, clientRequestId)
        return AppResult.Success(if (topicId.startsWith("5b-")) ProgressOutcome.PendingReview("demo-ap-14") else ProgressOutcome.Applied)
    }

    override suspend fun coverage(): AppResult<List<CoverageRow>> =
        if (auth.isDemoActive) AppResult.Success(DemoSyllabusData.coverage) else real.coverage()

    override suspend fun bookLists(): AppResult<List<BookList>> =
        if (auth.isDemoActive) AppResult.Success(DemoSyllabusData.bookLists) else real.bookLists()
}
