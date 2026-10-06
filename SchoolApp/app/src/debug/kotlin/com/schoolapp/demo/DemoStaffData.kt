package com.schoolapp.demo

import com.schoolapp.core.model.staff.StaffAssignment
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffSummary
import com.schoolapp.core.model.staff.StaffWorkload

/** Staff matching the Phase 2 seed: demo teacher, coordinator, accountant, 3 teachers, one on probation. */
internal object DemoStaffData {

    private fun summary(id: String, name: String, designation: String, roles: List<String>, sections: Int, subjects: Int, probation: Boolean = false) =
        StaffSummary(
            id, name, null, "EMP-${id.takeLast(2)}", designation, DemoData.MAIN_BRANCH_NAME, "ACTIVE", roles, probation,
            if (probation) "Sana Iqbal" else null, sections, subjects,
        )

    val staff = listOf(
        summary("demo-staff-01", "Demo Teacher", "Senior Teacher", listOf("TEACHER"), 2, 1),
        summary("demo-staff-02", "Sana Iqbal", "Coordinator", listOf("COORDINATOR"), 4, 0),
        summary("demo-staff-03", "Usman Raza", "Accountant", listOf("ACCOUNTANT"), 0, 0),
        summary("demo-staff-04", "Bilal Ahmed", "Teacher", listOf("TEACHER"), 2, 2),
        summary("demo-staff-05", "Hina Shah", "Teacher", listOf("TEACHER"), 2, 1),
        summary("demo-staff-06", "Kamran Ali", "Teacher (new)", listOf("TEACHER"), 1, 1, probation = true),
    )

    private val assignments = mapOf(
        "demo-staff-01" to listOf(
            StaffAssignment("demo-as-1", "CLASS_TEACHER", "Class 5", "A", null, null, null, false),
            StaffAssignment("demo-as-2", "SUBJECT_TEACHER", "Class 5", "A", "Mathematics", null, null, false),
            StaffAssignment("demo-as-3", "SUBJECT_TEACHER", "Class 5", "B", "Mathematics", null, null, false),
        ),
        "demo-staff-06" to listOf(
            StaffAssignment("demo-as-4", "SUBJECT_TEACHER", "Class 4", "A", "Science", null, null, false),
            StaffAssignment("demo-as-5", "SUBJECT_TEACHER", "Class 5", "B", "Science", null, "2026-10-31", true),
        ),
    )

    fun detail(id: String): StaffDetail? = staff.firstOrNull { it.id == id }?.let { s ->
        StaffDetail(s, "${s.name.lowercase().replace(' ', '.')}@eschool.local", "0300765432${id.last()}", "M.Sc", "2023-08-01", assignments[id].orEmpty())
    }

    fun workload(id: String): StaffWorkload =
        staff.firstOrNull { it.id == id }?.let { StaffWorkload(it.sectionCount * 9 + it.subjectCount * 3, it.sectionCount, it.subjectCount) }
            ?: StaffWorkload(0, 0, 0)
}
