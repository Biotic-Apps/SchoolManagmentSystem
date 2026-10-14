package com.schoolapp.core.data.people

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.model.people.ApplicationInput
import com.schoolapp.core.model.people.ChildInput
import com.schoolapp.core.model.people.EnrollmentChange
import com.schoolapp.core.model.people.GuardianEntry
import com.schoolapp.core.model.people.GuardianInput
import com.schoolapp.core.model.people.LinkGuardianInput
import com.schoolapp.core.model.people.RegisterStudentInput
import com.schoolapp.core.model.people.RegisteredStudent
import com.schoolapp.core.model.people.StudentUpdate
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.StudentAdminApi
import com.schoolapp.core.network.dto.people.ApplicationRequest
import com.schoolapp.core.network.dto.people.ChangeSectionRequest
import com.schoolapp.core.network.dto.people.ChildRequest
import com.schoolapp.core.network.dto.people.GuardianRequest
import com.schoolapp.core.network.dto.people.LinkGuardianRequest
import com.schoolapp.core.network.dto.people.RegisterStudentRequest
import com.schoolapp.core.network.dto.people.TransferRequest
import com.schoolapp.core.network.dto.people.UpdateGuardianRequest
import com.schoolapp.core.network.dto.people.UpdateStudentRequest
import com.schoolapp.core.network.dto.people.WithdrawRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultStudentAdminRepository @Inject constructor(
    private val api: StudentAdminApi,
    private val apiCaller: ApiCaller,
) : StudentAdminRepository {

    override suspend fun register(input: RegisterStudentInput): AppResult<RegisteredStudent> = apiCaller.call {
        val dto = api.register(RegisterStudentRequest(input.child.toRequest(), input.guardians.map { it.toRequest() }, input.sectionId, input.admissionDate)).data
        RegisteredStudent(
            dto.id, dto.name, dto.admissionNo,
            dto.parentLogins.map { com.schoolapp.core.model.admissions.ParentLogin(it.guardianName, it.status, it.email, it.phone, it.temporaryPassword, it.reason) },
        )
    }

    override suspend fun update(studentId: String, update: StudentUpdate): AppResult<Unit> = apiCaller.call {
        api.update(
            studentId,
            UpdateStudentRequest(update.firstName.trim(), update.lastName.trim(), update.dob, update.gender, update.bForm.clean(), update.address.trim()),
        )
    }.map { }

    override suspend fun changeEnrollment(studentId: String, change: EnrollmentChange): AppResult<Unit> = apiCaller.call {
        val reason = change.reason.trim()
        when (change) {
            is EnrollmentChange.Withdraw -> api.withdraw(studentId, WithdrawRequest(change.effectiveDate, reason))
            is EnrollmentChange.ChangeSection -> api.changeSection(studentId, ChangeSectionRequest(change.sectionId, change.effectiveDate, reason))
            is EnrollmentChange.Transfer -> api.transfer(studentId, TransferRequest(change.toBranchId, change.effectiveDate, reason))
        }
    }.map { }

    override suspend fun linkGuardian(studentId: String, input: LinkGuardianInput): AppResult<Unit> = apiCaller.call {
        api.linkGuardian(studentId, LinkGuardianRequest(input.relation, input.isPrimary, input.guardianId, input.guardian?.toRequest(null)))
    }.map { }

    override suspend fun updateGuardian(guardianId: String, input: GuardianInput): AppResult<Unit> = apiCaller.call {
        api.updateGuardian(
            guardianId,
            UpdateGuardianRequest(input.name.trim(), input.relation, input.phone.trim(), input.email.clean(), input.occupation.clean(), input.address.clean()),
        )
    }.map { }

    override suspend fun createApplication(input: ApplicationInput): AppResult<String> = apiCaller.call {
        api.createApplication(
            ApplicationRequest(
                input.branchId, input.sessionId, input.classId, input.child.toRequest(),
                input.guardians.map { it.toRequest() }, input.notes.clean(),
            ),
        ).data.id
    }
}

internal fun ChildInput.toRequest() = ChildRequest(
    firstName.trim(), lastName.trim(), dob, gender, bForm.clean(), previousSchool.clean(), address.clean(),
)

internal fun GuardianInput.toRequest(isPrimary: Boolean?) = GuardianRequest(
    name.trim(), relation, phone.trim(), cnic.clean(), email.clean(), occupation.clean(), address.clean(), isPrimary,
)

internal fun GuardianEntry.toRequest() = guardian.toRequest(isPrimary)
