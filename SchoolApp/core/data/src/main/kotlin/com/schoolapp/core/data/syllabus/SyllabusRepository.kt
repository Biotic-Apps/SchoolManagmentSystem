package com.schoolapp.core.data.syllabus

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.syllabus.BookList
import com.schoolapp.core.model.syllabus.CoverageRow
import com.schoolapp.core.model.syllabus.ProgressOutcome
import com.schoolapp.core.model.syllabus.SyllabusPlan
import com.schoolapp.core.model.syllabus.TopicProgressUpdate
import kotlinx.coroutines.flow.Flow

interface SyllabusRepository {
    /** Topic ids with a progress update still waiting in the offline outbox. */
    val queuedTopicIds: Flow<Set<String>>

    suspend fun plans(sectionId: String? = null, subjectId: String? = null): AppResult<List<SyllabusPlan>>

    /**
     * Sends the update with [clientRequestId] as idempotency key. Without network it is queued in the
     * outbox and [ProgressOutcome.Queued] is returned; the sync worker sends it later with the same key.
     */
    suspend fun updateProgress(topicId: String, update: TopicProgressUpdate, clientRequestId: String): AppResult<ProgressOutcome>

    suspend fun coverage(): AppResult<List<CoverageRow>>
    suspend fun bookLists(): AppResult<List<BookList>>
}
