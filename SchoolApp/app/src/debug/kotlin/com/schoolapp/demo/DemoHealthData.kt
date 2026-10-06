package com.schoolapp.demo

import com.schoolapp.core.model.health.Allergy
import com.schoolapp.core.model.health.EmergencyContact
import com.schoolapp.core.model.health.HealthContact
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.model.health.Incident
import com.schoolapp.core.model.health.IncidentSeverity
import com.schoolapp.core.model.health.IncidentType
import com.schoolapp.core.model.health.Medication
import kotlinx.coroutines.flow.MutableStateFlow

/** Ayesha (5-A) has a peanut allergy with instructions; one minor incident yesterday in 5-A. */
internal object DemoHealthData {

    private val bloodGroups = listOf("A+", "B+", "O+", "AB+", "B-", "O-")

    val incidents = MutableStateFlow(seedIncidents())

    fun profile(studentId: String): HealthProfile? {
        val index = DemoPeopleData.students.indexOfFirst { it.id == studentId }
        if (index < 0) return null
        val student = DemoPeopleData.students[index]
        val surname = student.name.substringAfter(' ')
        val contacts = listOf(
            EmergencyContact(student.primaryGuardianName ?: "Guardian", "Father", student.primaryGuardianPhone ?: "03001234500", 1),
            EmergencyContact("Sadia $surname", "Mother", "03214567890", 2),
        )
        if (studentId != DemoPeopleData.CHILD_1) {
            return HealthProfile(bloodGroups[index % bloodGroups.size], emptyList(), emptyList(), emptyList(), null, null, contacts, null)
        }
        return HealthProfile(
            bloodGroup = "B+",
            allergies = listOf(Allergy("Peanuts", "SEVERE", "Swelling of lips and difficulty breathing")),
            conditions = listOf("Mild asthma"),
            medications = listOf(Medication("EpiPen (adrenaline auto-injector)", "0.15 mg", "Only in an emergency")),
            instructions = "No peanuts or peanut butter in snacks. EpiPen is in the class teacher's drawer; call the parents immediately after use.",
            doctor = HealthContact("Dr. Farah Siddiqui", "04235761234"),
            emergencyContacts = contacts,
            updatedAt = DemoDates.iso(DemoDates.previousSchoolDays(10).last(), "10:00"),
        )
    }

    private fun seedIncidents(): List<Incident> {
        val student = DemoPeopleData.students.first { it.name == "Hamza Iqbal" }
        return listOf(
            Incident(
                "demo-inc-1", student.id, student.name, DemoDates.iso(DemoDates.previousSchoolDays(1).first(), "10:45"),
                IncidentType.INJURY, IncidentSeverity.MINOR, "Scraped his knee while running during break.",
                "Wound cleaned and bandaged; parent informed by phone.", "OPEN", DemoActors.teacher.name,
            ),
        )
    }
}
