package com.schoolapp.core.data.diary

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.diary.DiaryInput
import com.schoolapp.core.model.diary.DiaryOutcome
import com.schoolapp.core.model.diary.MissingDiary
import kotlinx.coroutines.flow.Flow

interface DiaryRepository {
    /** Slot keys ([com.schoolapp.core.model.diary.diarySlotKey]) with a save/publish still in the outbox. */
    val queuedSlots: Flow<Set<String>>

    /** Parents get PUBLISHED entries of their child's section only (server-side). */
    suspend fun entries(sectionId: String?, date: String? = null, from: String? = null, to: String? = null): AppResult<List<DiaryEntry>>

    /** Upserts the DRAFT; offline it is queued and [DiaryOutcome.Queued] returned. */
    suspend fun saveDraft(input: DiaryInput, clientRequestId: String): AppResult<DiaryOutcome>

    /**
     * Saves [input] then publishes it. [entryId] is the existing server id, if any; offline both calls are
     * queued in order (the publish resolves the new id from the queued save).
     */
    suspend fun publish(input: DiaryInput, entryId: String?, clientRequestId: String): AppResult<DiaryOutcome>

    suspend fun returnEntry(id: String, comment: String): AppResult<DiaryEntry>

    suspend fun missing(branchId: String?, date: String): AppResult<List<MissingDiary>>
}
