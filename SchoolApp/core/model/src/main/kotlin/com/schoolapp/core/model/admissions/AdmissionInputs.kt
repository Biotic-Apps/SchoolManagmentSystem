package com.schoolapp.core.model.admissions

import com.schoolapp.core.model.people.ChildInput
import com.schoolapp.core.model.people.GuardianEntry

data class EnquiryInput(
    val branchId: String,
    val sessionId: String,
    val classId: String,
    val childName: String,
    val dob: String?,
    val guardianName: String,
    val phone: String,
    val email: String?,
    val source: String?,
    val notes: String?,
    val followUpDate: String?,
)

/** Follow-up of an enquiry; [status] null keeps the current one. */
data class EnquiryUpdate(val status: EnquiryStatus?, val notes: String?, val followUpDate: String?)

/** Child, guardians, medical and notes of an application (create and edit). */
data class ApplicationFormInput(
    val child: ChildInput,
    val guardians: List<GuardianEntry>,
    val medical: MedicalInfo?,
    val notes: String?,
)

/** [scheduledAt] is an ISO-8601 instant. */
data class TestSchedule(val scheduledAt: String, val venue: String?, val notes: String?)

data class TestResult(val score: Double, val maxScore: Double, val remarks: String?)

enum class AdmissionFeeStatus { PAID, WAIVED, PENDING }

data class ConfirmAdmissionInput(
    val feeStatus: AdmissionFeeStatus,
    val feeReference: String?,
    /** Paisa; only for PAID. */
    val feeAmountMinor: Long?,
    val sectionId: String,
    val admissionDate: String,
)

data class ConfirmedAdmission(val studentId: String, val admissionNo: String?, val parentLogins: List<ParentLogin>)

/** CREATED carries a one-time [temporaryPassword]; EXISTING keeps their own; SKIPPED says why in [reason]. */
data class ParentLogin(
    val guardianName: String,
    val status: String,
    val email: String?,
    val phone: String?,
    val temporaryPassword: String?,
    val reason: String?,
)
