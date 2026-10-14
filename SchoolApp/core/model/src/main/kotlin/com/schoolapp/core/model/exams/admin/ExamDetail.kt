package com.schoolapp.core.model.exams.admin

import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.ExamType

/** One scheduled paper of an exam (date sheet row). Times are `HH:mm` (24h, as the API sends them). */
data class ExamPaper(
    val id: String?,
    val classId: String,
    val className: String,
    val subjectId: String,
    val subjectName: String,
    val date: String,
    val startTime: String,
    val endTime: String,
    val maxMarks: Int,
    val passMarks: Int,
    val roomId: String?,
)

/** `GET /exams/:id`: the full exam with its classes and date sheet. */
data class ExamDetail(
    val id: String,
    val branchId: String?,
    val sessionId: String?,
    val termId: String?,
    val name: String,
    val type: ExamType?,
    val status: ExamStatus,
    val gradingScheme: PersonRef?,
    val weightPercent: Int?,
    val classes: List<PersonRef>,
    /** Set while the results wait for the principal's approval. */
    val approvalId: String?,
    val computedAt: String?,
    val publishedAt: String?,
    val papers: List<ExamPaper>,
) {
    val classIds: List<String> get() = classes.mapNotNull { it.id }
    val awaitingApproval: Boolean get() = status == ExamStatus.MARKS_CLOSED && approvalId != null
}

/** Create / update body. [termId] and [weightPercent] are optional; branch and session are ignored on update. */
data class ExamInput(
    val branchId: String,
    val sessionId: String,
    val termId: String?,
    val name: String,
    val type: ExamType,
    val gradingSchemeId: String,
    val weightPercent: Int?,
    val classIds: List<String>,
)

/** One paper sent with `PUT /exams/:id/schedule`; [date] `yyyy-MM-dd`, times `HH:mm`. */
data class SchedulePaperInput(
    val classId: String,
    val subjectId: String,
    val date: String,
    val startTime: String,
    val endTime: String,
    val maxMarks: Int,
    val passMarks: Int,
    val roomId: String?,
)

/** A row of a 409 conflict (sheets blocking approval, schedule clashes), read tolerantly. */
data class ExamConflict(
    val label: String,
    val status: String? = null,
    val classId: String? = null,
    val subjectId: String? = null,
    val date: String? = null,
)

/** What `POST /exams/:id/print` renders. */
enum class ExamPrintKind { REPORT_CARDS, DATE_SHEET, AWARD_LIST }

/** Print scope: none = whole exam; [sectionId] or [classId]; [subjectId] only for award lists. */
data class ExamPrintInput(
    val kind: ExamPrintKind,
    val classId: String? = null,
    val sectionId: String? = null,
    val subjectId: String? = null,
    val templateId: String? = null,
)
