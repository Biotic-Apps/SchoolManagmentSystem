package com.schoolapp.core.model.exams

import com.schoolapp.core.model.common.PersonRef

/** NOT_ENTERED → DRAFT → SUBMITTED → ACCEPTED | RETURNED; PENDING_REVIEW while a probation review holds it. */
enum class MarkSheetStatus {
    NOT_ENTERED, DRAFT, SUBMITTED, PENDING_REVIEW, ACCEPTED, RETURNED;

    /** Teachers may still type marks. */
    val isEditable: Boolean get() = this == NOT_ENTERED || this == DRAFT || this == RETURNED
}

data class MarkSheet(
    val id: String,
    val examId: String,
    val examName: String?,
    val className: String,
    val subjectId: String?,
    val subjectName: String,
    val sectionId: String,
    val sectionName: String,
    val maxMarks: Double,
    val passMarks: Double?,
    val paperDate: String?,
    val status: MarkSheetStatus,
    val teacher: PersonRef?,
    val entered: Int,
    val total: Int,
    val comment: String?,
    val rows: List<MarkRow> = emptyList(),
) {
    val title: String get() = "$className-$sectionName · $subjectName"
}

/** [marks] null = pending (never treated as 0); [absent] rows need no marks. */
data class MarkRow(
    val studentId: String,
    val name: String,
    val rollNo: Int?,
    val marks: Double?,
    val absent: Boolean,
    val remark: String?,
) {
    val isPending: Boolean get() = marks == null && !absent
}
