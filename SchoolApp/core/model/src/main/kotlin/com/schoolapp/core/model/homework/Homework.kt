package com.schoolapp.core.model.homework

import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.files.Attachment

enum class HomeworkStatus { ACTIVE, ARCHIVED, UNKNOWN }

enum class SubmissionStatus { SUBMITTED, LATE, GRADED, RETURNED, UNKNOWN }

/** One homework assignment for a section (`GET /homework`, `GET /homework/student/:id`). */
data class Homework(
    val id: String,
    val classId: String?,
    val sectionId: String,
    val className: String?,
    val sectionName: String?,
    val subjectId: String?,
    val subjectName: String,
    val title: String,
    val description: String,
    /** `YYYY-MM-DD`. */
    val dueDate: String,
    val maxMarks: Int?,
    val attachments: List<Attachment>,
    val assignedBy: PersonRef?,
    val status: HomeworkStatus,
    val submissionCount: Int,
    val gradedCount: Int,
    val createdAt: String?,
)

data class HomeworkSubmission(
    val id: String,
    val homeworkId: String,
    val student: PersonRef?,
    val submittedAt: String?,
    val text: String?,
    val attachments: List<Attachment>,
    val marks: Int?,
    val grade: String?,
    val feedback: String?,
    val gradedBy: PersonRef?,
    val gradedAt: String?,
    val status: SubmissionStatus,
) {
    /** Parents may submit again until the teacher grades it (same rule as the web). */
    val canResubmit: Boolean get() = status != SubmissionStatus.GRADED

    /** Teachers grade or return only fresh submissions. */
    val isReviewable: Boolean get() = status == SubmissionStatus.SUBMITTED || status == SubmissionStatus.LATE
}

data class NewHomework(
    val sectionId: String,
    val subjectId: String,
    val title: String,
    val description: String,
    val dueDate: String,
    val maxMarks: Int?,
    val attachmentFileIds: List<String>,
)

data class SubmissionGrade(val marks: Int?, val grade: String?, val feedback: String?)

/** Mutation broadcast so open homework lists can refresh. */
enum class HomeworkChange { ASSIGNED, GRADED, RETURNED, SUBMITTED }
