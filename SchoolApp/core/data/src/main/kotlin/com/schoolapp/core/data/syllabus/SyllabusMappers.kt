package com.schoolapp.core.data.syllabus

import com.schoolapp.core.model.syllabus.BookItem
import com.schoolapp.core.model.syllabus.BookList
import com.schoolapp.core.model.syllabus.CoverageRow
import com.schoolapp.core.model.syllabus.PlanProgress
import com.schoolapp.core.model.syllabus.ProgressOutcome
import com.schoolapp.core.model.syllabus.SyllabusChapter
import com.schoolapp.core.model.syllabus.SyllabusPlan
import com.schoolapp.core.model.syllabus.SyllabusTopic
import com.schoolapp.core.model.syllabus.TopicProgressUpdate
import com.schoolapp.core.model.syllabus.TopicStatus
import com.schoolapp.core.network.dto.syllabus.BookListDto
import com.schoolapp.core.network.dto.syllabus.ChapterDto
import com.schoolapp.core.network.dto.syllabus.CoverageDto
import com.schoolapp.core.network.dto.syllabus.ProgressDto
import com.schoolapp.core.network.dto.syllabus.SyllabusPlanDto
import com.schoolapp.core.network.dto.syllabus.TopicDto
import com.schoolapp.core.network.dto.syllabus.TopicProgressBodyDto
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlin.math.roundToInt

internal const val PENDING_REVIEW = "PENDING_REVIEW"

internal fun SyllabusPlanDto.toModel(): SyllabusPlan {
    val mappedChapters = chapters.sortedBy { it.order }.map { it.toModel() }
    return SyllabusPlan(
        id = id,
        sectionId = sectionId,
        sectionName = sectionName,
        className = className,
        subjectId = subjectId,
        subjectName = subjectName,
        revision = revision,
        status = status,
        chapters = mappedChapters,
        progress = progress?.toModel() ?: mappedChapters.flatMap { it.topics }.progress(),
    )
}

internal fun ChapterDto.toModel() = SyllabusChapter(id, title, order, topics.sortedBy { it.order }.map { it.toModel() })

internal fun TopicDto.toModel() = SyllabusTopic(
    id, title, order, targetDate, TopicStatus.fromKey(status), completedOn, isDelayed, pendingReview,
)

internal fun ProgressDto.toModel() = PlanProgress(total, completed, delayed, percent.roundToInt().coerceIn(0, 100))

internal fun List<SyllabusTopic>.progress(): PlanProgress {
    val done = count { it.status == TopicStatus.COMPLETED }
    val percent = if (isEmpty()) 0 else done * 100 / size
    return PlanProgress(size, done, count { it.isDelayed }, percent)
}

internal fun CoverageDto.toModel() = CoverageRow(
    sectionId = sectionId ?: section?.id,
    className = className ?: section?.className,
    sectionName = sectionName ?: section?.name,
    subjectName = subjectName ?: subject?.name,
    progress = PlanProgress(total, completed, delayed, percent.roundToInt().coerceIn(0, 100)),
)

internal fun BookListDto.toModel() = BookList(
    id = id,
    className = className,
    revision = revision,
    status = status,
    approvedAt = approvedAt,
    items = items.map { BookItem(it.title, it.subjectName, it.author, it.publisher, it.isMandatory, it.priceMinor) },
)

internal fun TopicProgressUpdate.toBody() = TopicProgressBodyDto(
    status = status.name,
    completedOn = completedOn?.takeIf { status == TopicStatus.COMPLETED },
    note = note?.trim()?.takeIf { it.isNotEmpty() },
)

/** A probation hold answers `{ status: "PENDING_REVIEW", approvalId }`; anything else means it was applied. */
internal fun JsonObject.toProgressOutcome(): ProgressOutcome {
    val status = (this["status"] as? JsonPrimitive)?.content
    if (status != PENDING_REVIEW) return ProgressOutcome.Applied
    return ProgressOutcome.PendingReview((this["approvalId"] as? JsonPrimitive)?.content)
}
