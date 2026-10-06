package com.schoolapp.demo

import com.schoolapp.core.model.syllabus.BookItem
import com.schoolapp.core.model.syllabus.BookList
import com.schoolapp.core.model.syllabus.CoverageRow
import com.schoolapp.core.model.syllabus.PlanProgress
import com.schoolapp.core.model.syllabus.SyllabusChapter
import com.schoolapp.core.model.syllabus.SyllabusPlan
import com.schoolapp.core.model.syllabus.SyllabusTopic
import com.schoolapp.core.model.syllabus.TopicStatus

/** Approved Maths plan for 5-A (some topics done/delayed), a 5-B plan, book lists and coverage. */
internal object DemoSyllabusData {

    private fun topic(id: String, title: String, order: Int, target: String, status: TopicStatus, done: String? = null, delayed: Boolean = false) =
        SyllabusTopic(id, title, order, target, status, done, delayed, false)

    private fun plan(id: String, sectionId: String, section: String, chapters: List<SyllabusChapter>): SyllabusPlan {
        val topics = chapters.flatMap { it.topics }
        val done = topics.count { it.status == TopicStatus.COMPLETED }
        return SyllabusPlan(
            id, sectionId, section, "Class 5", "demo-sub-2", "Mathematics", 1, "APPROVED", chapters,
            PlanProgress(topics.size, done, topics.count { it.isDelayed }, if (topics.isEmpty()) 0 else done * 100 / topics.size),
        )
    }

    private fun chapters(prefix: String) = listOf(
        SyllabusChapter(
            "$prefix-ch1", "Whole numbers", 1,
            listOf(
                topic("$prefix-t1", "Place value up to millions", 1, "2026-04-20", TopicStatus.COMPLETED, "2026-04-18"),
                topic("$prefix-t2", "Comparing and ordering", 2, "2026-04-30", TopicStatus.COMPLETED, "2026-05-02"),
                topic("$prefix-t3", "Rounding off", 3, "2026-05-10", TopicStatus.COMPLETED, "2026-05-09"),
            ),
        ),
        SyllabusChapter(
            "$prefix-ch2", "Fractions", 2,
            listOf(
                topic("$prefix-t4", "Equivalent fractions", 1, "2026-08-20", TopicStatus.COMPLETED, "2026-08-21"),
                topic("$prefix-t5", "Adding unlike fractions", 2, "2026-09-15", TopicStatus.IN_PROGRESS, delayed = true),
                topic("$prefix-t6", "Mixed numbers", 3, "2026-10-10", TopicStatus.NOT_STARTED),
            ),
        ),
        SyllabusChapter(
            "$prefix-ch3", "Decimals", 3,
            listOf(
                topic("$prefix-t7", "Tenths and hundredths", 1, "2026-10-30", TopicStatus.NOT_STARTED),
                topic("$prefix-t8", "Decimal addition", 2, "2026-11-15", TopicStatus.NOT_STARTED),
            ),
        ),
    )

    val plans = listOf(
        plan("demo-plan-5a-math", "demo-sec-5a", "A", chapters("5a")),
        plan("demo-plan-5b-math", "demo-sec-5b", "B", chapters("5b").map { ch -> ch.copy(topics = ch.topics.map { if (it.order == 1) it else it.copy(status = TopicStatus.NOT_STARTED, completedOn = null) }) }),
    )

    val bookLists = listOf(
        BookList(
            "demo-bl-5", "Class 5", 2, "APPROVED", "2026-03-20T09:00:00Z",
            listOf(
                BookItem("New Countdown 5", "Mathematics", "Dr. Fong Ho Kheong", "Oxford", true, 95000),
                BookItem("Oxford Reading Tree 5", "English", null, "Oxford", true, 82000),
                BookItem("Science Explorer 5", "Science", null, "Paramount", true, 76000),
                BookItem("Drawing Book", "Art", null, "Local", false, 15000),
            ),
        ),
        BookList(
            "demo-bl-4", "Class 4", 1, "APPROVED", "2026-03-18T09:00:00Z",
            listOf(
                BookItem("New Countdown 4", "Mathematics", null, "Oxford", true, 90000),
                BookItem("Urdu Ki Kitab 4", "Urdu", null, "Gaba", true, 40000),
            ),
        ),
    )

    val coverage: List<CoverageRow> = plans.map { CoverageRow(it.sectionId, it.className, it.sectionName, it.subjectName, it.progress) } +
        listOf(
            CoverageRow("demo-sec-5a", "Class 5", "A", "English", PlanProgress(10, 6, 0, 60)),
            CoverageRow("demo-sec-4a", "Class 4", "A", "Science", PlanProgress(9, 2, 2, 22)),
            CoverageRow("demo-sec-4b", "Class 4", "B", "Mathematics", PlanProgress(8, 4, 0, 50)),
        )
}
