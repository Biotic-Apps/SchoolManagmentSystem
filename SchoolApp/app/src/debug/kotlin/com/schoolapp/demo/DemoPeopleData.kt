package com.schoolapp.demo

import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.people.ChildLinkRequest
import com.schoolapp.core.model.people.Enrollment
import com.schoolapp.core.model.people.Guardian
import com.schoolapp.core.model.people.GuardianLink
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.model.people.StudentDocument
import com.schoolapp.core.model.people.StudentSummary

/** Students and guardians matching the Phase 2 seed (contract section 9); debug preview only. */
internal object DemoPeopleData {
    const val CHILD_1 = "demo-child-1"
    const val CHILD_2 = "demo-child-2"

    val sections = listOf(
        Section("demo-sec-5a", "demo-c-5", "Class 5", "A", 35, "Room 12", 6, "ACTIVE"),
        Section("demo-sec-5b", "demo-c-5", "Class 5", "B", 35, "Room 14", 4, "ACTIVE"),
        Section("demo-sec-4a", "demo-c-4", "Class 4", "A", 35, "Room 8", 3, "ACTIVE"),
        Section("demo-sec-4b", "demo-c-4", "Class 4", "B", 35, "Room 9", 3, "ACTIVE"),
    )

    private val names = mapOf(
        "demo-sec-5a" to listOf("Ayesha Khan", "Bilal Ahmed", "Fatima Noor", "Hamza Iqbal", "Zainab Ali", "Usman Tariq"),
        "demo-sec-5b" to listOf("Maryam Raza", "Saad Hussain", "Hira Javed", "Ali Hassan"),
        "demo-sec-4a" to listOf("Ibrahim Shah", "Anaya Malik", "Daniyal Butt"),
        "demo-sec-4b" to listOf("Omar Khan", "Sana Pervez", "Rayyan Aslam"),
    )

    val students: List<StudentSummary> = sections.flatMap { section ->
        names.getValue(section.id).mapIndexed { index, name ->
            val id = when (name) {
                "Ayesha Khan" -> CHILD_1
                "Omar Khan" -> CHILD_2
                else -> "demo-st-${section.id}-$index"
            }
            StudentSummary(
                id = id,
                admissionNo = "BS-2026-%04d".format(10 + sectionOffset(section.id) + index),
                name = name,
                photoUrl = null,
                gender = if (index % 2 == 0) "FEMALE" else "MALE",
                dob = if (section.className == "Class 5") "2016-03-1${index}" else "2017-05-2${index}",
                className = section.className,
                sectionName = section.name,
                sectionId = section.id,
                rollNo = index + 1,
                status = "ACTIVE",
                primaryGuardianName = guardianNameFor(name),
                primaryGuardianPhone = "0300123${4500 + index}",
            )
        }
    }

    private fun sectionOffset(sectionId: String) = sections.indexOfFirst { it.id == sectionId } * 10

    private fun guardianNameFor(child: String) = if (child.endsWith("Khan")) "Imran Khan" else "Parent of ${child.substringBefore(' ')}"

    fun detail(id: String): StudentDetail? {
        val student = students.firstOrNull { it.id == id } ?: return null
        val father = Guardian("demo-g-$id-f", student.primaryGuardianName ?: "Guardian", "FATHER", student.primaryGuardianPhone, "parent@eschool.local", "Engineer", "12 Canal Road, Lahore", true)
        val mother = Guardian("demo-g-$id-m", "Sadia ${student.name.substringAfter(' ')}", "MOTHER", "03214567890", null, "Teacher", "12 Canal Road, Lahore", false)
        return StudentDetail(
            summary = student,
            branchName = DemoData.MAIN_BRANCH_NAME,
            bForm = "35202-*******-1",
            address = "12 Canal Road, Lahore",
            admissionDate = "2024-04-01",
            enrollment = Enrollment(
                "demo-en-$id", DemoData.MAIN_BRANCH_NAME, "2026-27", student.sectionId, student.className, student.sectionName,
                student.rollNo, "2026-04-01", null, "ACTIVE",
            ),
            guardians = listOf(
                GuardianLink("demo-gl-$id-f", father, "FATHER", true, "VERIFIED"),
                GuardianLink("demo-gl-$id-m", mother, "MOTHER", false, "VERIFIED"),
            ),
            documents = listOf(
                StudentDocument("demo-doc-$id-1", "B_FORM", null, "application/pdf", "VERIFIED", null),
                StudentDocument("demo-doc-$id-2", "PREVIOUS_RESULT", null, "application/pdf", "UPLOADED", "Class 4 result card"),
            ),
        )
    }

    val guardians = listOf(
        Guardian("demo-g-1", "Imran Khan", "FATHER", "03001234500", "parent@eschool.local", "Engineer", null, true),
        Guardian("demo-g-2", "Nadia Ahmed", "MOTHER", "03001234501", null, "Doctor", null, true),
        Guardian("demo-g-3", "Tariq Noor", "FATHER", "03001234502", null, "Banker", null, false),
        Guardian("demo-g-4", "Kashif Raza", "GUARDIAN", "03001234503", null, null, null, false),
    )

    val childLinkRequests = listOf(
        ChildLinkRequest(
            "demo-cl-1", "Kashif Raza", "03001234503", "Maryam Raza", "BS-2026-0020", "Class 5", "B", "GUARDIAN",
            "REQUESTED", "2026-10-04T10:20:00Z",
        ),
    )
}
