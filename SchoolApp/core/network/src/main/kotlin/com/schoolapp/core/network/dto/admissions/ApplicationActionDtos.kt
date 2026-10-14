package com.schoolapp.core.network.dto.admissions

import com.schoolapp.core.network.dto.people.ChildRequest
import com.schoolapp.core.network.dto.people.GuardianRequest
import kotlinx.serialization.Serializable

/** `POST /admissions/applications` with the optional medical block. */
@Serializable
data class CreateApplicationBodyDto(
    val branchId: String,
    val sessionId: String,
    val classId: String,
    val child: ChildRequest,
    val guardians: List<GuardianRequest>,
    val medical: MedicalDto? = null,
    val notes: String? = null,
)

/** `PATCH /admissions/applications/:id` (only before a decision). */
@Serializable
data class UpdateApplicationBodyDto(
    val child: ChildRequest,
    val guardians: List<GuardianRequest>,
    val medical: MedicalDto? = null,
    val notes: String? = null,
)

@Serializable
data class ScheduleTestBodyDto(val scheduledAt: String, val venue: String? = null, val notes: String? = null)

@Serializable
data class TestResultBodyDto(val score: Double, val maxScore: Double, val remarks: String? = null)

@Serializable
data class WithdrawBodyDto(val reason: String)

@Serializable
data class AdmissionFeeBodyDto(val status: String, val reference: String? = null, val amountMinor: Long? = null)

@Serializable
data class ConfirmBodyDto(val admissionFee: AdmissionFeeBodyDto, val sectionId: String, val admissionDate: String)

@Serializable
data class ConfirmedApplicationDto(
    val application: ApplicationDto? = null,
    val studentId: String,
    val admissionNo: String? = null,
    val parentLogins: List<ParentLoginDto> = emptyList(),
)

@Serializable
data class ParentLoginDto(
    val guardianId: String? = null,
    val guardianName: String = "",
    val status: String = "SKIPPED",
    val email: String? = null,
    val phone: String? = null,
    val temporaryPassword: String? = null,
    val reason: String? = null,
)

/** `POST /admissions/applications/:id/documents`; [fileId] comes from `POST /files` (purpose DOCUMENT). */
@Serializable
data class AttachDocumentBodyDto(val docType: String, val fileId: String, val note: String? = null)

@Serializable
data class VerifyDocumentBodyDto(val note: String? = null)

@Serializable
data class RejectDocumentBodyDto(val reason: String)
