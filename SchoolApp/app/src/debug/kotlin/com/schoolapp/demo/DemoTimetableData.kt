package com.schoolapp.demo

import com.schoolapp.core.model.timetable.Period
import com.schoolapp.core.model.timetable.SectionTimetable
import com.schoolapp.core.model.timetable.TeacherSlot
import com.schoolapp.core.model.timetable.TimetableSlot

/** Bell schedule (8 periods incl. a break) and published timetables for Class 5-A / 5-B; Mon-Sat. */
internal object DemoTimetableData {

    val periods = listOf(
        Period(1, "08:00", "08:40", false, null),
        Period(2, "08:40", "09:20", false, null),
        Period(3, "09:20", "10:00", false, null),
        Period(4, "10:00", "10:40", false, null),
        Period(5, "10:40", "11:00", true, "Break"),
        Period(6, "11:00", "11:40", false, null),
        Period(7, "11:40", "12:20", false, null),
        Period(8, "12:20", "13:00", false, null),
    )

    private val subjects = listOf("Mathematics", "English", "Science", "Urdu", "Islamiyat", "Computer", "Art")
    private val teachers = mapOf(
        "Mathematics" to "Demo Teacher", "English" to "Bilal Ahmed", "Science" to "Kamran Ali", "Urdu" to "Hina Shah",
        "Islamiyat" to "Hina Shah", "Computer" to "Bilal Ahmed", "Art" to "Sana Iqbal",
    )
    private val days = 1..6
    private val teaching = periods.filterNot { it.isBreak }

    private fun subjectAt(day: Int, periodIndex: Int, offset: Int) = subjects[(day + periodIndex + offset) % subjects.size]

    fun section(sectionId: String): SectionTimetable {
        val offset = sectionId.hashCode().mod(subjects.size)
        val slots = days.flatMap { day ->
            teaching.map { p ->
                val subject = subjectAt(day, p.index, offset)
                TimetableSlot(day, p.index, subject, teachers[subject], if (sectionId.endsWith("b")) "Room 14" else "Room 12")
            }
        }
        return SectionTimetable(sectionId, "PUBLISHED", 2, "2026-09-01T08:00:00Z", slots, periods)
    }

    /** Demo teacher: Maths in 5-A (periods 1, 3) and 5-B (periods 2, 6); Wednesday period 7 is a substitution. */
    val teacherWeek: List<TeacherSlot> = days.flatMap { day ->
        listOf(1 to "A", 2 to "B", 3 to "A", 6 to "B").map { (index, section) -> teacherSlot(day, index, section, false) } +
            listOfNotNull(if (day == 3) teacherSlot(day, 7, "A", true) else null)
    }

    private fun teacherSlot(day: Int, index: Int, section: String, substitute: Boolean): TeacherSlot {
        val period = periods.first { it.index == index }
        return TeacherSlot(
            null, day, index, period.startTime, period.endTime, section, "Class 5",
            if (substitute) "Science" else "Mathematics", "Demo Teacher", if (section == "A") "Room 12" else "Room 14", substitute,
        )
    }

    /** Parent view of a child's section as `/timetables/me?studentId=` slots (teacher names shown). */
    fun childWeek(sectionId: String?, className: String?, sectionName: String?): List<TeacherSlot> {
        val table = section(sectionId ?: "demo-sec-5a")
        return table.slots.map { slot ->
            val period = periods.first { it.index == slot.periodIndex }
            TeacherSlot(null, slot.day, slot.periodIndex, period.startTime, period.endTime, sectionName, className, slot.subjectName, slot.staffName, slot.roomName, false)
        }
    }
}
