package com.schoolapp.demo

import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.diary.DiaryStatus
import kotlinx.coroutines.flow.MutableStateFlow
import java.time.LocalDate

/**
 * Diary for 5-A / 5-B over the last 5 school days (Maths by Demo Teacher, English by Bilal Ahmed, all published);
 * today 5-A Maths is a helper DRAFT and 5-B Science is PENDING_REVIEW by the probation teacher Kamran Ali.
 */
internal object DemoDiaryData {
    const val MATHS = "demo-sub-2"
    const val ENGLISH = "demo-sub-1"
    const val SCIENCE = "demo-sub-3"
    val classSections = listOf("demo-sec-5a", "demo-sec-5b")

    fun subjectName(id: String?): String? = DemoData.subjects.firstOrNull { it.id == id }?.name

    fun entry(
        id: String,
        sectionId: String,
        subjectId: String,
        date: String,
        topics: String,
        homework: String?,
        status: DiaryStatus,
        author: String,
        onBehalfOf: String? = null,
        publishedAt: String? = null,
    ): DiaryEntry {
        val section = DemoPeopleData.sections.first { it.id == sectionId }
        return DiaryEntry(
            id = id,
            sectionId = sectionId,
            className = section.className,
            sectionName = section.name,
            subjectId = subjectId,
            subjectName = subjectName(subjectId),
            date = date,
            topics = topics,
            homework = homework,
            dueDate = homework?.let { LocalDate.parse(date).plusDays(1).toString() },
            attachments = emptyList(),
            status = status,
            revision = 1,
            authorName = author,
            onBehalfOfName = onBehalfOf,
            comment = null,
            publishedAt = publishedAt,
        )
    }

    private val mathsTopics = listOf(
        "Fractions: adding unlike denominators" to "Exercise 4.2, questions 1 to 10",
        "Fractions: word problems" to "Exercise 4.3, questions 1 to 6",
        "Decimals: place value" to "Worksheet on place value",
        "Decimals: comparing and ordering" to null,
        "Revision quiz: fractions and decimals" to "Prepare for Friday's test",
    )

    private val englishTopics = listOf(
        "Reading: The Honest Woodcutter" to "Answer questions 1 to 5 on page 32",
        "Grammar: adjectives and adverbs" to "Write 10 sentences using adverbs",
        "Creative writing: My best friend" to "Finish the paragraph",
        "Comprehension practice" to null,
        "Spelling test: unit 3 words" to "Learn unit 4 spellings",
    )

    /** Declared after the topic lists, which [seed] reads. */
    val entries = MutableStateFlow(seed())

    private fun seed(): List<DiaryEntry> {
        val today = DemoDates.today()
        val days = listOf(today) + DemoDates.previousSchoolDays(4)
        val result = mutableListOf<DiaryEntry>()
        days.forEachIndexed { index, day ->
            val date = day.toString()
            val published = DemoDates.iso(day, "14:15")
            classSections.forEach { sectionId ->
                val (mTopic, mHomework) = mathsTopics[index % mathsTopics.size]
                val (eTopic, eHomework) = englishTopics[index % englishTopics.size]
                val draftByHelper = index == 0 && sectionId == "demo-sec-5a"
                result += entry(
                    "demo-dy-$sectionId-$date-m", sectionId, MATHS, date, mTopic, mHomework,
                    if (draftByHelper) DiaryStatus.DRAFT else DiaryStatus.PUBLISHED,
                    if (draftByHelper) DemoActors.helper.name else DemoActors.teacher.name,
                    onBehalfOf = if (draftByHelper) DemoActors.teacher.name else null,
                    publishedAt = if (draftByHelper) null else published,
                )
                result += entry(
                    "demo-dy-$sectionId-$date-e", sectionId, ENGLISH, date, eTopic, eHomework,
                    DiaryStatus.PUBLISHED, "Bilal Ahmed", publishedAt = published,
                )
            }
        }
        result += entry(
            "demo-dy-5b-today-sci", "demo-sec-5b", SCIENCE, today.toString(), "Plants: parts of a flower",
            "Draw and label a flower", DiaryStatus.PENDING_REVIEW, DemoActors.probationTeacher.name,
        )
        return result
    }
}
