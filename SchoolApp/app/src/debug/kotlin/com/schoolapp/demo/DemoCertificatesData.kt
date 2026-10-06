package com.schoolapp.demo

import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.model.certificates.CertificateType
import com.schoolapp.core.model.certificates.ClearanceBlock
import kotlinx.coroutines.flow.MutableStateFlow

/**
 * Contract §J seed: a CHARACTER certificate ISSUED for CHILD_1, a SCHOOL_LEAVING request for CHILD_2 blocked by
 * dues, and a TRANSFER request (another student) that approves cleanly. No PDF url in the demo.
 */
internal object DemoCertificatesData {
    const val BLOCKED_ID = "demo-cert-2"

    /** Clearance problems per student; approving their leaving/transfer request is blocked. */
    val clearanceByStudent: Map<String, ClearanceBlock> = mapOf(
        DemoPeopleData.CHILD_2 to ClearanceBlock(outstandingMinor = 450_000, unreturnedItems = emptyList(), reasons = listOf("Outstanding fee balance")),
    )

    val certificates = MutableStateFlow(seed())

    private fun seed(): List<Certificate> {
        val days = DemoDates.previousSchoolDays(12)
        val transferStudent = DemoPeopleData.students.first { it.sectionId == "demo-sec-5b" && it.rollNo == 2 }
        return listOf(
            certificate(
                id = "demo-cert-1", type = CertificateType.CHARACTER, status = CertificateStatus.ISSUED,
                studentId = DemoPeopleData.CHILD_1, purpose = "Summer camp application",
                requestedAt = DemoDates.iso(days[11], "09:30"),
            ).copy(serial = "CERT-CHARACTER-2026-0001", issuedOn = days[8].toString()),
            certificate(
                id = BLOCKED_ID, type = CertificateType.SCHOOL_LEAVING, status = CertificateStatus.REQUESTED,
                studentId = DemoPeopleData.CHILD_2, purpose = "Family relocating to Lahore",
                requestedAt = DemoDates.iso(days[1], "10:15"),
            ),
            certificate(
                id = "demo-cert-3", type = CertificateType.TRANSFER, status = CertificateStatus.REQUESTED,
                studentId = transferStudent.id, purpose = "Admission at another branch closer to home",
                requestedAt = DemoDates.iso(days[0], "12:40"),
            ),
        )
    }

    fun certificate(
        id: String,
        type: CertificateType,
        status: CertificateStatus,
        studentId: String,
        purpose: String?,
        requestedAt: String,
    ): Certificate {
        val student = DemoPeopleData.students.firstOrNull { it.id == studentId }
        return Certificate(
            id = id,
            type = type,
            status = status,
            serial = null,
            studentId = studentId,
            studentName = student?.name ?: "Student",
            className = student?.className,
            sectionName = student?.sectionName,
            purpose = purpose,
            requestedBy = if (student?.name?.endsWith("Khan") == true) DemoActors.parent else DemoActors.principal,
            createdAt = requestedAt,
            issuedOn = null,
            fileUrl = null,
            reason = null,
        )
    }
}
