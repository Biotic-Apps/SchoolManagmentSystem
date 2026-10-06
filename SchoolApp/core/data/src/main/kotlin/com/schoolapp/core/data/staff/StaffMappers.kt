package com.schoolapp.core.data.staff

import com.schoolapp.core.model.staff.StaffAssignment
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffSummary
import com.schoolapp.core.model.staff.StaffWorkload
import com.schoolapp.core.network.dto.staff.StaffAssignmentDto
import com.schoolapp.core.network.dto.staff.StaffDetailDto
import com.schoolapp.core.network.dto.staff.StaffSummaryDto
import com.schoolapp.core.network.dto.staff.StaffWorkloadDto

internal fun StaffSummaryDto.toModel() = StaffSummary(
    id, name, photoUrl, employeeNo, designation, branchName, status, roles, requiresReview, reviewer?.name,
    sectionCount, subjectCount,
)

internal fun StaffDetailDto.toModel() = StaffDetail(
    summary = StaffSummary(
        id, name, photoUrl, employeeNo, designation, branchName, status, roles, requiresReview, reviewer?.name,
        sectionCount, subjectCount,
    ),
    email = email,
    phone = phone,
    qualification = qualification,
    joinDate = joinDate,
    assignments = assignments.map { it.toModel() },
)

internal fun StaffAssignmentDto.toModel() = StaffAssignment(
    id, kind, className, sectionName, subjectName, responsibleStaff?.name, validUntil, isSubstitute,
)

internal fun StaffWorkloadDto.toModel() = StaffWorkload(periodsPerWeek, sections, subjects)
