package com.schoolapp.core.data.people

import com.schoolapp.core.model.people.ChildLinkChallenge
import com.schoolapp.core.model.people.ChildLinkRequest
import com.schoolapp.core.model.people.Enrollment
import com.schoolapp.core.model.people.Guardian
import com.schoolapp.core.model.people.GuardianLink
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.core.model.people.StudentDocument
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.network.dto.people.ChildLinkChallengeDto
import com.schoolapp.core.network.dto.people.ChildLinkRequestDto
import com.schoolapp.core.network.dto.people.DocumentDto
import com.schoolapp.core.network.dto.people.EnrollmentDto
import com.schoolapp.core.network.dto.people.GuardianDto
import com.schoolapp.core.network.dto.people.GuardianLinkDto
import com.schoolapp.core.network.dto.people.StudentDetailDto
import com.schoolapp.core.network.dto.people.StudentSummaryDto

internal fun StudentSummaryDto.toModel() = StudentSummary(
    id = id,
    admissionNo = admissionNo,
    name = name,
    photoUrl = photoUrl,
    gender = gender,
    dob = dob,
    className = className,
    sectionName = sectionName,
    sectionId = sectionId,
    rollNo = rollNo,
    status = status,
    primaryGuardianName = primaryGuardian?.name,
    primaryGuardianPhone = primaryGuardian?.phone,
)

internal fun StudentDetailDto.toModel() = StudentDetail(
    summary = StudentSummary(
        id, admissionNo, name, photoUrl, gender, dob, className, sectionName, sectionId, rollNo, status,
        primaryGuardian?.name, primaryGuardian?.phone,
    ),
    branchName = branchName,
    bForm = bForm,
    address = address,
    admissionDate = admissionDate,
    enrollment = enrollment?.toModel(),
    guardians = guardians.sortedByDescending { it.isPrimary }.map { it.toModel() },
    documents = documents.map { it.toModel() },
)

internal fun EnrollmentDto.toModel() = Enrollment(
    id, branchName, sessionName, sectionId, className, sectionName, rollNo, startDate, endDate, status,
)

internal fun GuardianDto.toModel() = Guardian(id, name, relation, phone, email, occupation, address, hasAccount)

internal fun GuardianLinkDto.toModel() = GuardianLink(id, guardian.toModel(), relation ?: guardian.relation, isPrimary, status)

internal fun DocumentDto.toModel() = StudentDocument(id, docType, file?.url, file?.mime, status, note)

internal fun ChildLinkChallengeDto.toModel() = ChildLinkChallenge(requestId, maskedPhone, devCode)

internal fun ChildLinkRequestDto.toModel() = ChildLinkRequest(
    id = id,
    guardianName = guardian?.name,
    guardianPhone = guardian?.phone,
    studentName = student?.name,
    admissionNo = student?.admissionNo,
    className = student?.className,
    sectionName = student?.sectionName,
    relation = relation,
    status = status,
    createdAt = createdAt,
)
