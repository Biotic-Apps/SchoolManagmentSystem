package com.schoolapp.core.data.admissions

import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.AdmissionTest
import com.schoolapp.core.model.admissions.ApplicantGuardian
import com.schoolapp.core.model.admissions.ApplicationStatus
import com.schoolapp.core.network.dto.admissions.ApplicationDto

internal fun ApplicationDto.toModel() = AdmissionApplication(
    id = id,
    applicationNo = applicationNo,
    status = ApplicationStatus.fromKey(status),
    childName = listOfNotNull(child?.firstName, child?.lastName).joinToString(" ").ifBlank { applicationNo ?: id },
    dob = child?.dob,
    gender = child?.gender,
    className = className,
    previousSchool = child?.previousSchool,
    guardians = guardians.sortedByDescending { it.isPrimary }.map { ApplicantGuardian(it.name, it.relation, it.phone, it.isPrimary) },
    waitlistPosition = waitlistPosition,
    test = test?.let { AdmissionTest(it.scheduledAt, it.venue, it.score, it.maxScore, it.remarks) },
    documentCount = documents.size,
    decisionReason = decisionReason,
    createdAt = createdAt,
)
