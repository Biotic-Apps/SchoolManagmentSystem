package com.schoolapp.demo

import com.schoolapp.core.model.common.PersonRef
import com.schoolapp.core.model.progress.HomeworkTick
import com.schoolapp.core.model.progress.ProgressCategory
import com.schoolapp.core.model.progress.ProgressNote
import kotlinx.coroutines.flow.MutableStateFlow

/** Demo progress notes for CHILD_1 / CHILD_2 and Class 5-A, plus saved homework ticks per diary entry. */
internal object DemoProgressData {
    private val mathsTeacher = PersonRef("demo-u-teacher", "Demo Teacher")
    private val englishTeacher = PersonRef("demo-u-teacher-eng", "Nadia Farooq")

    val notes = MutableStateFlow(seed())

    /** diaryId → latest ticks saved in the demo. */
    val homeworkTicks = MutableStateFlow<Map<String, List<HomeworkTick>>>(emptyMap())

    private fun seed(): List<ProgressNote> {
        val days = DemoDates.previousSchoolDays(6)
        val fiveA = { index: Int -> "demo-st-demo-sec-5a-$index" }
        return listOf(
            note("pn-1", DemoPeopleData.CHILD_1, ProgressCategory.ACHIEVEMENT, "Won first place in the class spelling bee. Well done!", true, mathsTeacher, days[0], "11:20"),
            note("pn-2", DemoPeopleData.CHILD_1, ProgressCategory.HOMEWORK, "Maths homework is neat and complete every day this week.", true, mathsTeacher, days[1], "13:05"),
            note("pn-3", DemoPeopleData.CHILD_1, ProgressCategory.LEARNING, "Needs a little extra practice with long division; will pair with a buddy in class.", false, mathsTeacher, days[3], "10:40"),
            note("pn-4", DemoPeopleData.CHILD_2, ProgressCategory.BEHAVIOUR, "Very helpful to classmates during group work.", true, englishTeacher, days[0], "12:15"),
            note("pn-5", DemoPeopleData.CHILD_2, ProgressCategory.HOMEWORK, "English reading log missing two days; reminded in class.", true, englishTeacher, days[2], "09:50"),
            note("pn-6", DemoPeopleData.CHILD_2, ProgressCategory.BEHAVIOUR, "Was restless after break; discussed calmly, no further action.", false, englishTeacher, days[4], "11:45"),
            note("pn-7", fiveA(1), ProgressCategory.LEARNING, "Reads fluently; ready for the next reading level.", true, mathsTeacher, days[1], "10:10"),
            note("pn-8", fiveA(2), ProgressCategory.HOMEWORK, "Science worksheet incomplete twice this week.", true, mathsTeacher, days[2], "13:30"),
            note("pn-9", fiveA(3), ProgressCategory.BEHAVIOUR, "Talked over others in class discussion; spoke to him privately.", false, mathsTeacher, days[5], "12:00"),
        )
    }

    private fun note(
        id: String,
        studentId: String,
        category: ProgressCategory,
        text: String,
        visibleToParent: Boolean,
        author: PersonRef,
        day: java.time.LocalDate,
        time: String,
    ) = ProgressNote(
        id = "demo-$id",
        studentId = studentId,
        category = category,
        note = text,
        visibleToParent = visibleToParent,
        author = author,
        createdAt = DemoDates.iso(day, time),
    )
}
