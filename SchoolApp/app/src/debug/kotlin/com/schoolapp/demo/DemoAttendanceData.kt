package com.schoolapp.demo

import com.schoolapp.core.model.attendance.AttendanceRegister
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.EntryMark
import com.schoolapp.core.model.attendance.RegisterEntry
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.model.common.PersonRef
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update

/**
 * Registers keyed by `sectionId|date`: the previous 10 school days are SUBMITTED (yesterday) or LOCKED with mixed
 * statuses; today 5-A is a helper DRAFT, 5-B is UNMARKED and the Class 4 sections are SUBMITTED.
 */
internal object DemoAttendanceData {

    private val registers = MutableStateFlow(seed())

    private fun key(sectionId: String, date: String) = "$sectionId|$date"

    fun all(): Collection<AttendanceRegister> = registers.value.values

    /** Stored register, or an UNMARKED one with the section roster. */
    fun register(sectionId: String, date: String): AttendanceRegister =
        registers.value[key(sectionId, date)] ?: blank(sectionId, date)

    fun put(register: AttendanceRegister) = registers.update { it + (key(register.sectionId, register.date) to register) }

    fun applyMarks(base: AttendanceRegister, marks: List<EntryMark>): List<RegisterEntry> {
        val byStudent = marks.associateBy { it.studentId }
        return base.entries.map { entry ->
            val mark = byStudent[entry.studentId] ?: return@map entry
            entry.copy(
                entryId = entry.entryId ?: "demo-ae-${base.sectionId}-${base.date}-${entry.studentId}",
                status = mark.status,
                remark = mark.remark,
            )
        }
    }

    private fun blank(sectionId: String, date: String) = AttendanceRegister(
        null, sectionId, date, RegisterStatus.UNMARKED, 0, null, null, null, roster(sectionId, date) { null },
    )

    private fun roster(sectionId: String, date: String, statusAt: (Int) -> AttendanceStatus?): List<RegisterEntry> =
        DemoPeopleData.students.filter { it.sectionId == sectionId }.mapIndexed { index, s ->
            val status = statusAt(index)
            RegisterEntry(
                entryId = if (status == null) null else "demo-ae-$sectionId-$date-${s.id}",
                studentId = s.id,
                name = s.name,
                rollNo = s.rollNo,
                photoUrl = s.photoUrl,
                status = status,
                remark = if (status == AttendanceStatus.LATE) "Arrived at 8:15 AM" else null,
                onLeave = status == AttendanceStatus.LEAVE,
            )
        }

    private fun mixedStatus(dayIndex: Int, studentIndex: Int): AttendanceStatus = when ((dayIndex * 3 + studentIndex * 5) % 13) {
        0 -> AttendanceStatus.ABSENT
        1 -> AttendanceStatus.LATE
        2 -> AttendanceStatus.LEAVE
        3 -> if (dayIndex % 2 == 0) AttendanceStatus.HALF_DAY else AttendanceStatus.PRESENT
        else -> AttendanceStatus.PRESENT
    }

    private fun seed(): Map<String, AttendanceRegister> {
        val today = DemoDates.todayKey()
        val result = mutableMapOf<String, AttendanceRegister>()
        DemoDates.previousSchoolDays(10).forEachIndexed { dayIndex, day ->
            val date = day.toString()
            DemoPeopleData.sections.forEach { section ->
                val status = if (dayIndex == 0) RegisterStatus.SUBMITTED else RegisterStatus.LOCKED
                result[key(section.id, date)] = AttendanceRegister(
                    id = "demo-ar-${section.id}-$date",
                    sectionId = section.id,
                    date = date,
                    status = status,
                    version = 1,
                    submittedBy = submitter(section.id),
                    onBehalfOf = null,
                    lockedAt = if (status == RegisterStatus.LOCKED) DemoDates.iso(day, "11:00") else null,
                    entries = roster(section.id, date) { mixedStatus(dayIndex, it) },
                )
            }
        }
        result[key(SECTION_5A, today)] = AttendanceRegister(
            "demo-ar-5a-today", SECTION_5A, today, RegisterStatus.DRAFT, 1, DemoActors.helper, null, null,
            roster(SECTION_5A, today) { index ->
                when {
                    index >= 4 -> null
                    index == 2 -> AttendanceStatus.ABSENT
                    else -> AttendanceStatus.PRESENT
                }
            },
        )
        listOf("demo-sec-4a", "demo-sec-4b").forEach { id ->
            result[key(id, today)] = AttendanceRegister(
                "demo-ar-$id-today", id, today, RegisterStatus.SUBMITTED, 1, submitter(id), null, null,
                roster(id, today) { if (it == 2) AttendanceStatus.LATE else AttendanceStatus.PRESENT },
            )
        }
        return result
    }

    private fun submitter(sectionId: String): PersonRef = when (sectionId) {
        SECTION_5A -> DemoActors.teacher
        "demo-sec-5b" -> PersonRef("demo-staff-05", "Hina Shah")
        "demo-sec-4a" -> PersonRef("demo-staff-06", "Kamran Ali")
        else -> PersonRef("demo-staff-04", "Bilal Ahmed")
    }

    private const val SECTION_5A = "demo-sec-5a"
}
