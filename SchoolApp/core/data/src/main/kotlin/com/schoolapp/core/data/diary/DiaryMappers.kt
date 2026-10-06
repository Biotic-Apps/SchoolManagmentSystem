package com.schoolapp.core.data.diary

import com.schoolapp.core.data.common.STATUS_PENDING_REVIEW
import com.schoolapp.core.data.common.approvalId
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.data.common.isPendingReview
import com.schoolapp.core.data.common.orNullIfEmpty
import com.schoolapp.core.data.common.toAttachments
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.diary.DiaryInput
import com.schoolapp.core.model.diary.DiaryOutcome
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.model.diary.MissingDiary
import com.schoolapp.core.network.dto.diary.DiaryBodyDto
import com.schoolapp.core.network.dto.diary.DiaryEntryDto
import com.schoolapp.core.network.dto.diary.MissingDiaryDto
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject

internal fun DiaryEntryDto.toModel() = DiaryEntry(
    id = id,
    sectionId = sectionId,
    className = className,
    sectionName = sectionName,
    subjectId = subject?.id ?: subjectId,
    subjectName = subject?.name,
    date = date,
    topics = topics.orEmpty(),
    homework = homework,
    dueDate = dueDate,
    attachments = attachments.toAttachments(),
    status = enumOrDefault(status, DiaryStatus.DRAFT),
    revision = revision,
    authorName = author?.name,
    onBehalfOfName = onBehalfOf?.name,
    comment = comment,
    publishedAt = publishedAt,
)

internal fun MissingDiaryDto.toModel() = MissingDiary(
    sectionId = sectionId,
    className = className,
    sectionName = sectionName,
    subjectId = subject?.id ?: subjectId,
    subjectName = subject?.name ?: subjectName,
)

internal fun DiaryInput.toBody(clientRequestId: String) = DiaryBodyDto(
    sectionId = sectionId,
    subjectId = subjectId,
    date = date,
    topics = topics.trim(),
    homework = homework.clean(),
    dueDate = dueDate,
    attachmentFileIds = attachmentFileIds.orNullIfEmpty(),
    clientRequestId = clientRequestId,
)

/** Saved entry, or a review hold (moderation SUBMITTED, probation PENDING_REVIEW, or a bare `{ status, approvalId }`). */
internal fun JsonObject.toDiaryOutcome(json: Json): DiaryOutcome {
    if (isPendingReview() && !containsKey("id")) return DiaryOutcome.PendingReview(approvalId())
    val entry = json.decodeFromJsonElement(DiaryEntryDto.serializer(), this)
    return when (entry.status) {
        DiaryStatus.SUBMITTED.name, STATUS_PENDING_REVIEW -> DiaryOutcome.PendingReview(entry.approvalId ?: approvalId())
        else -> DiaryOutcome.Saved(entry.toModel())
    }
}
