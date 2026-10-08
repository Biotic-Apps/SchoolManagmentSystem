package com.schoolapp.core.model.academics

import com.schoolapp.core.model.timetable.TimetableState

/**
 * `GET /classes/:id/setup`: one class's sections, curriculum and subject-teacher allocation.
 * [canEditStructure] = classes.edit managing the branch; [canAllocate] = may pick class/subject teachers.
 */
data class ClassSetup(
    val classId: String,
    val className: String,
    val levelOrder: Int,
    val branchId: String?,
    val sessionId: String?,
    val sections: List<SetupSection>,
    val subjects: List<ClassSubject>,
    val allocation: List<AllocationCell>,
    val groups: List<String>,
    val canEditStructure: Boolean,
    val canAllocate: Boolean,
) {
    fun cell(sectionId: String, subjectId: String): AllocationCell? =
        allocation.firstOrNull { it.sectionId == sectionId && it.subjectId == subjectId }

    /** A group subject (e.g. Physics → Science) is only taught to sections of that group. */
    fun sectionsFor(subject: ClassSubject): List<SetupSection> =
        sections.filter { subject.group == null || it.group == subject.group }

    /** Section × subject pairs that still have no teacher. */
    val unallocated: Int
        get() = subjects.sumOf { subject -> sectionsFor(subject).count { cell(it.id, subject.subjectId)?.staff == null } }
}

data class SetupSection(
    val id: String,
    val name: String,
    val group: String?,
    val studentCount: Int,
    val capacity: Int?,
    val room: NamedRef?,
    val classTeacher: NamedRef?,
    val timetable: TimetableState?,
)

/** One subject of the class's curriculum; list order = sortOrder. */
data class ClassSubject(
    val subjectId: String,
    val code: String?,
    val name: String,
    val periodsPerWeek: Int?,
    val isOptional: Boolean,
    val group: String?,
)

/** Teacher of one subject in one section; [placed] = draft lessons already in the timetable. */
data class AllocationCell(
    val sectionId: String,
    val subjectId: String,
    val staff: NamedRef?,
    val placed: Int,
)
