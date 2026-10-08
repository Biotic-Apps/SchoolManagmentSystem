package com.schoolapp.core.model.organisation

import com.schoolapp.core.model.timetable.TimetableState

/** One class card of the Classes overview (`GET /classes/overview`). */
data class ClassOverview(
    val id: String,
    val name: String,
    val levelOrder: Int?,
    val status: String?,
    val studentCount: Int,
    val capacity: Int?,
    val sections: List<SectionOverview>,
    val subjects: List<ClassSubjectRef>,
    /** Equals subjects.size, except on older servers that only send a count. */
    val subjectCount: Int = subjects.size,
    val issues: List<ClassIssue>,
    val unallocated: Int,
)

data class SectionOverview(
    val id: String,
    val name: String,
    val group: String?,
    val studentCount: Int,
    val capacity: Int?,
    val roomName: String?,
    val classTeacherName: String?,
    val timetable: TimetableState?,
)

data class ClassSubjectRef(val id: String, val name: String, val periodsPerWeek: Int?, val group: String?)

enum class ClassIssue {
    NO_SECTIONS,
    NO_SUBJECTS,
    NO_CLASS_TEACHER,
    SUBJECTS_WITHOUT_TEACHER,
    NO_TIMETABLE,
    ;

    companion object {
        fun parse(raw: String): ClassIssue? = entries.firstOrNull { it.name == raw }
    }
}
