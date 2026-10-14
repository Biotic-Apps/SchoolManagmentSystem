package com.schoolapp.core.data.admissions

import com.schoolapp.core.data.common.clean
import com.schoolapp.core.data.people.toRequest
import com.schoolapp.core.model.admissions.AdmissionFeeStatus
import com.schoolapp.core.model.admissions.ApplicationFormInput
import com.schoolapp.core.model.admissions.ConfirmAdmissionInput
import com.schoolapp.core.model.admissions.EnquiryInput
import com.schoolapp.core.model.admissions.EnquiryUpdate
import com.schoolapp.core.model.admissions.MedicalInfo
import com.schoolapp.core.model.admissions.TestResult
import com.schoolapp.core.model.admissions.TestSchedule
import com.schoolapp.core.model.people.ApplicationInput
import com.schoolapp.core.network.dto.admissions.AdmissionFeeBodyDto
import com.schoolapp.core.network.dto.admissions.ConfirmBodyDto
import com.schoolapp.core.network.dto.admissions.CreateApplicationBodyDto
import com.schoolapp.core.network.dto.admissions.CreateEnquiryBodyDto
import com.schoolapp.core.network.dto.admissions.MedicalDto
import com.schoolapp.core.network.dto.admissions.ScheduleTestBodyDto
import com.schoolapp.core.network.dto.admissions.TestResultBodyDto
import com.schoolapp.core.network.dto.admissions.UpdateApplicationBodyDto
import com.schoolapp.core.network.dto.admissions.UpdateEnquiryBodyDto

internal fun EnquiryInput.toBody() = CreateEnquiryBodyDto(
    branchId = branchId,
    sessionId = sessionId,
    classId = classId,
    childName = childName.trim(),
    dob = dob.clean(),
    guardianName = guardianName.trim(),
    phone = phone.trim(),
    email = email.clean(),
    source = source.clean(),
    notes = notes.clean(),
    followUpDate = followUpDate.clean(),
)

/** Notes are always sent (blank clears them); the date only when set (the API keeps the old one otherwise). */
internal fun EnquiryUpdate.toBody() = UpdateEnquiryBodyDto(status?.name, notes?.trim().orEmpty(), followUpDate.clean())

internal fun MedicalInfo.toDto(): MedicalDto? =
    MedicalDto(allergies.clean(), conditions.clean(), notes.clean())
        .takeIf { it.allergies != null || it.conditions != null || it.notes != null }

internal fun createBody(input: ApplicationInput, medical: MedicalInfo?) = CreateApplicationBodyDto(
    branchId = input.branchId,
    sessionId = input.sessionId,
    classId = input.classId,
    child = input.child.toRequest(),
    guardians = input.guardians.map { it.toRequest() },
    medical = medical?.toDto(),
    notes = input.notes.clean(),
)

internal fun ApplicationFormInput.toUpdateBody() = UpdateApplicationBodyDto(
    child = child.toRequest(),
    guardians = guardians.map { it.toRequest() },
    // Always sent on edit so clearing every medical field clears the block.
    medical = medical?.let { MedicalDto(it.allergies.clean(), it.conditions.clean(), it.notes.clean()) },
    notes = notes?.trim().orEmpty(),
)

internal fun TestSchedule.toBody() = ScheduleTestBodyDto(scheduledAt, venue.clean(), notes.clean())

internal fun TestResult.toBody() = TestResultBodyDto(score, maxScore, remarks.clean())

internal fun ConfirmAdmissionInput.toBody(): ConfirmBodyDto {
    val paid = feeStatus == AdmissionFeeStatus.PAID
    val fee = AdmissionFeeBodyDto(feeStatus.name, if (paid) feeReference.clean() else null, if (paid) feeAmountMinor else null)
    return ConfirmBodyDto(fee, sectionId, admissionDate)
}
