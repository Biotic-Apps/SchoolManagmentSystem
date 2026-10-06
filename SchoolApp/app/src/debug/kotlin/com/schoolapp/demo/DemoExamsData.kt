package com.schoolapp.demo

import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.exams.Exam
import com.schoolapp.core.model.exams.ExamStatus
import com.schoolapp.core.model.exams.ExamType
import com.schoolapp.core.model.exams.MarkRow
import com.schoolapp.core.model.exams.MarkSheet
import com.schoolapp.core.model.exams.MarkSheetStatus
import com.schoolapp.core.model.exams.StudentResult
import com.schoolapp.core.model.exams.SubjectResult
import kotlinx.coroutines.flow.MutableStateFlow

/** Exams, mark sheets and published results matching the Phase 4 seed (contract section J); debug preview only. */
internal object DemoExamsData {
    const val UNIT_TEST = "demo-exam-unit1"
    const val MID_TERM = "demo-exam-mid"
    const val FINAL = "demo-exam-final"

    private const val MAX = 100.0
    private const val PASS = 33.0

    private val otherTeacher = PersonRef("demo-u-teacher-2", "Nadia Hussain")

    val exams = listOf(
        Exam(UNIT_TEST, "Unit test 1", ExamType.UNIT_TEST, ExamStatus.PUBLISHED, "Term 1"),
        Exam(MID_TERM, "Mid-term exam", ExamType.MIDTERM, ExamStatus.PUBLISHED, "Term 1"),
        Exam(FINAL, "Final exam", ExamType.FINAL, ExamStatus.MARKS_OPEN, "Term 2"),
    )

    fun examName(id: String): String? = exams.firstOrNull { it.id == id }?.name

    /** Final exam sheets; mutated by save/submit/accept/return while the demo runs. */
    val sheets = MutableStateFlow(initialSheets())

    private fun initialSheets(): List<MarkSheet> {
        val paperDate = DemoDates.previousSchoolDays(3).last().toString()
        return listOf(
            // 5-A Maths: some marks (one is a real 0), some pending, one absent.
            sheet("demo-ms-5a-maths", "demo-sec-5a", "Mathematics", MarkSheetStatus.DRAFT, DemoActors.teacher, paperDate) { index ->
                when (index) {
                    0 -> 78.0 to false
                    1 -> 0.0 to false
                    3 -> null to true
                    4 -> 91.5 to false
                    else -> null to false
                }
            },
            sheet("demo-ms-5b-eng", "demo-sec-5b", "English", MarkSheetStatus.SUBMITTED, DemoActors.teacher, paperDate) { index ->
                listOf(64.0, 82.0, 47.5, 71.0).getOrNull(index) to false
            },
            sheet("demo-ms-5a-eng", "demo-sec-5a", "English", MarkSheetStatus.NOT_ENTERED, DemoActors.teacher, paperDate) { null to false },
            sheet("demo-ms-4a-maths", "demo-sec-4a", "Mathematics", MarkSheetStatus.ACCEPTED, otherTeacher, paperDate) { index ->
                listOf(88.0, 59.0, 73.0).getOrNull(index) to false
            },
            sheet("demo-ms-4b-eng", "demo-sec-4b", "English", MarkSheetStatus.SUBMITTED, otherTeacher, paperDate) { index ->
                listOf(69.0, 54.5, null).getOrNull(index) to (index == 2)
            },
            sheet("demo-ms-4b-sci", "demo-sec-4b", "Science", MarkSheetStatus.DRAFT, otherTeacher, paperDate) { index ->
                listOf(72.0, null, 65.0).getOrNull(index) to false
            },
        )
    }

    private fun sheet(
        id: String,
        sectionId: String,
        subject: String,
        status: MarkSheetStatus,
        teacher: PersonRef,
        paperDate: String,
        marksFor: (Int) -> Pair<Double?, Boolean>,
    ): MarkSheet {
        val section = DemoPeopleData.sections.first { it.id == sectionId }
        val rows = DemoPeopleData.students.filter { it.sectionId == sectionId }.mapIndexed { index, student ->
            val (marks, absent) = marksFor(index)
            MarkRow(student.id, student.name, student.rollNo, if (absent) null else marks, absent, null)
        }
        return MarkSheet(
            id = id,
            examId = FINAL,
            examName = examName(FINAL),
            className = section.className.orEmpty(),
            subjectId = "demo-subj-${subject.lowercase()}",
            subjectName = subject,
            sectionId = sectionId,
            sectionName = section.name,
            maxMarks = MAX,
            passMarks = PASS,
            paperDate = paperDate,
            status = status,
            teacher = teacher,
            entered = rows.count { !it.isPending },
            total = rows.size,
            comment = null,
            rows = rows,
        )
    }

    /** Published results per child: the unit test and the mid-term (newest first). */
    fun results(studentId: String): List<StudentResult> = when (studentId) {
        DemoPeopleData.CHILD_1 -> listOf(
            result(studentId, "Ayesha Khan", 1, MID_TERM, 32, listOf(84.0, 91.0, 78.0, 88.0), position = 2, teacherRemark = "Ayesha is attentive and helps classmates."),
            result(studentId, "Ayesha Khan", 1, UNIT_TEST, 62, listOf(76.0, 85.0, 70.0, 81.0), position = 4, teacherRemark = null),
        )
        DemoPeopleData.CHILD_2 -> listOf(
            result(studentId, "Omar Khan", 1, MID_TERM, 31, listOf(58.0, 29.0, 66.0, null), position = null, teacherRemark = "Omar needs regular maths practice at home."),
            result(studentId, "Omar Khan", 1, UNIT_TEST, 61, listOf(52.0, 41.0, 60.0, 57.0), position = null, teacherRemark = null),
        )
        else -> emptyList()
    }

    private val subjects = listOf("English", "Mathematics", "Science", "Urdu")

    @Suppress("LongParameterList")
    private fun result(
        studentId: String,
        name: String,
        rollNo: Int,
        examId: String,
        publishedDaysAgo: Long,
        marks: List<Double?>,
        position: Int?,
        teacherRemark: String?,
    ): StudentResult {
        val subjectResults = subjects.mapIndexed { index, subject ->
            val value = marks[index]
            SubjectResult(
                subjectId = "demo-subj-${subject.lowercase()}",
                name = subject,
                marks = value,
                maxMarks = MAX,
                absent = value == null,
                grade = value?.let(::grade),
                passed = value != null && value >= PASS,
            )
        }
        val total = marks.sumOf { it ?: 0.0 }
        val maxTotal = MAX * subjects.size
        val percent = Math.round(total / maxTotal * 1000) / 10.0
        val passed = subjectResults.all { it.passed }
        return StudentResult(
            studentId = studentId,
            name = name,
            rollNo = rollNo,
            examId = examId,
            examName = examName(examId).orEmpty(),
            publishedAt = DemoDates.iso(DemoDates.today().minusDays(publishedDaysAgo), "10:00"),
            subjects = subjectResults,
            totalMarks = total,
            maxTotal = maxTotal,
            percent = percent,
            grade = grade(percent),
            position = position,
            passed = passed,
            remarks = if (passed) "Promoted on merit." else "Needs improvement in failed subjects.",
            teacherRemark = teacherRemark,
        )
    }

    /** Seed grading scheme: A+ 90–100 … F 0–32. */
    private fun grade(percent: Double): String = when {
        percent >= 90 -> "A+"
        percent >= 80 -> "A"
        percent >= 70 -> "B"
        percent >= 60 -> "C"
        percent >= 50 -> "D"
        percent >= 33 -> "E"
        else -> "F"
    }
}
