package com.schoolapp.demo

import com.schoolapp.core.model.progress.HomeworkCompletionItem
import com.schoolapp.core.model.progress.HomeworkStatus

/** Last few days of homework for a demo child, newest first; today's work is not checked yet. */
internal object DemoHomeworkCompletionData {
    fun forChild(studentId: String): List<HomeworkCompletionItem> {
        val days = listOf(DemoDates.today()) + DemoDates.previousSchoolDays(4)
        val rows = listOf(
            Triple("Mathematics", "Exercise 4.2, questions 1 to 10", null),
            Triple("English", "Read chapter 3 and write a short summary", HomeworkStatus.DONE),
            Triple("Science", "Label the parts of a plant (worksheet)", HomeworkStatus.PARTIAL),
            Triple("Mathematics", "Times tables 6 to 9, practice sheet", HomeworkStatus.DONE),
            Triple("Urdu", "Copy the poem neatly", HomeworkStatus.NOT_DONE),
        )
        return rows.mapIndexed { index, (subject, text, status) ->
            val day = days[index]
            HomeworkCompletionItem("demo-hw-$studentId-$index", day.toString(), day.plusDays(1).toString(), subject, text, status)
        }
    }
}
