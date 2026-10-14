package com.schoolapp.core.data.admissions

import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.AdmissionTest
import com.schoolapp.core.model.admissions.ApplicantChild
import com.schoolapp.core.model.admissions.ApplicantGuardian
import com.schoolapp.core.model.admissions.ApplicationDocument
import com.schoolapp.core.model.admissions.ApplicationStatus
import com.schoolapp.core.model.admissions.ConfirmedAdmission
import com.schoolapp.core.model.admissions.Enquiry
import com.schoolapp.core.model.admissions.EnquiryStatus
import com.schoolapp.core.model.admissions.MedicalInfo
import com.schoolapp.core.model.admissions.ParentLogin
import com.schoolapp.core.network.dto.admissions.ApplicantGuardianDto
import com.schoolapp.core.network.dto.admissions.ApplicationDto
import com.schoolapp.core.network.dto.admissions.ConfirmedApplicationDto
import com.schoolapp.core.network.dto.admissions.EnquiryDto
import com.schoolapp.core.network.dto.people.DocumentDto

internal fun ApplicationDto.toModel() = AdmissionApplication(
    id = id,
    applicationNo = applicationNo,
    status = ApplicationStatus.fromKey(status),
    childName = listOfNotNull(child?.firstName, child?.lastName).joinToString(" ").trim().ifBlank { applicationNo ?: id },
    dob = child?.dob,
    gender = child?.gender,
    className = className,
    previousSchool = child?.previousSchool,
    guardians = guardians.sortedByDescending { it.isPrimary }.map { it.toModel() },
    waitlistPosition = waitlistPosition,
    test = test?.let { AdmissionTest(it.scheduledAt, it.venue, it.score, it.maxScore, it.remarks) },
    documentCount = documents.size,
    decisionReason = decisionReason,
    createdAt = createdAt,
    branchId = branchId,
    sessionId = sessionId,
    classId = classId,
    child = child?.let {
        ApplicantChild(it.firstName.orEmpty(), it.lastName.orEmpty(), it.dob, it.gender, it.bForm, it.previousSchool, it.address)
    },
    medical = medical?.let { MedicalInfo(it.allergies, it.conditions, it.notes) }?.takeIf { !it.isEmpty },
    notes = notes,
    studentId = studentId,
    documents = documents.map { it.toApplicationDocument() },
)

private fun ApplicantGuardianDto.toModel() =
    ApplicantGuardian(name, relation, phone, isPrimary, cnic, email, occupation, address)

internal fun DocumentDto.toApplicationDocument() = ApplicationDocument(id, docType, file?.url, status, note)

internal fun EnquiryDto.toModel() = Enquiry(
    id = id,
    classId = classId,
    className = className,
    childName = childName,
    dob = dob,
    guardianName = guardianName,
    phone = phone,
    email = email,
    source = source,
    notes = notes,
    followUpDate = followUpDate,
    status = EnquiryStatus.fromKey(status),
    applicationId = applicationId,
    createdAt = createdAt,
)

internal fun ConfirmedApplicationDto.toModel() = ConfirmedAdmission(
    studentId = studentId,
    admissionNo = admissionNo,
    parentLogins = parentLogins.map { ParentLogin(it.guardianName, it.status, it.email, it.phone, it.temporaryPassword, it.reason) },
)
