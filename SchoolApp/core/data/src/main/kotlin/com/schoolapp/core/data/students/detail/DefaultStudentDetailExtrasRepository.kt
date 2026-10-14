package com.schoolapp.core.data.students.detail

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.health.toModel
import com.schoolapp.core.data.people.toModel
import com.schoolapp.core.data.pickup.toModel
import com.schoolapp.core.model.health.HealthProfile
import com.schoolapp.core.model.pickup.PickupPerson
import com.schoolapp.core.model.students.detail.EnrollmentHistoryItem
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.StudentsApi
import com.schoolapp.core.network.api.students.detail.StudentDetailExtrasApi
import com.schoolapp.core.network.dto.health.AllergyDto
import com.schoolapp.core.network.dto.health.DoctorDto
import com.schoolapp.core.network.dto.health.EmergencyContactDto
import com.schoolapp.core.network.dto.health.MedicationDto
import com.schoolapp.core.network.dto.students.detail.HealthProfileBodyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultStudentDetailExtrasRepository @Inject constructor(
    private val students: StudentsApi,
    private val api: StudentDetailExtrasApi,
    private val apiCaller: ApiCaller,
) : StudentDetailExtrasRepository {

    override suspend fun enrollments(studentId: String): AppResult<List<EnrollmentHistoryItem>> = apiCaller.call {
        students.enrollments(studentId).data
            .map { EnrollmentHistoryItem(it.toModel(), it.reason?.takeIf(String::isNotBlank)) }
            .sortedByDescending { it.enrollment.startDate.orEmpty() }
    }

    override suspend fun replaceHealth(studentId: String, profile: HealthProfile): AppResult<HealthProfile> =
        apiCaller.call { api.replaceHealth(studentId, profile.toBody()).data.toModel() }

    override suspend fun verifyPickupPerson(id: String): AppResult<PickupPerson> =
        apiCaller.call { api.verifyPickupPerson(id).data.toModel() }

    override suspend fun revokePickupPerson(id: String): AppResult<PickupPerson> =
        apiCaller.call { api.revokePickupPerson(id).data.toModel() }

    private fun HealthProfile.toBody() = HealthProfileBodyDto(
        bloodGroup = bloodGroup.clean(),
        allergies = allergies.map { AllergyDto(it.name.trim(), it.severity, it.reaction.clean()) },
        conditions = conditions.map(String::trim),
        medications = medications.map { MedicationDto(it.name.trim(), it.dose.clean(), it.schedule.clean()) },
        instructions = instructions.clean(),
        doctor = doctor?.let { DoctorDto(it.name.trim(), it.phone.trim()) },
        emergencyContacts = emergencyContacts.mapIndexed { index, contact ->
            EmergencyContactDto(contact.name.trim(), contact.relation?.trim(), contact.phone.trim(), index + 1)
        },
    )

    private fun String?.clean(): String? = this?.trim()?.ifEmpty { null }
}
