package com.schoolapp.core.model.admissions

data class AdmissionApplication(
    val id: String,
    val applicationNo: String?,
    val status: ApplicationStatus,
    val childName: String,
    val dob: String?,
    val gender: String?,
    val className: String?,
    val previousSchool: String?,
    val guardians: List<ApplicantGuardian>,
    val waitlistPosition: Int?,
    val test: AdmissionTest?,
    val documentCount: Int,
    val decisionReason: String?,
    val createdAt: String?,
    val branchId: String? = null,
    val sessionId: String? = null,
    val classId: String? = null,
    val child: ApplicantChild? = null,
    val medical: MedicalInfo? = null,
    val notes: String? = null,
    val studentId: String? = null,
    val documents: List<ApplicationDocument> = emptyList(),
)

/** The child as typed on the application (B-Form comes back masked). */
data class ApplicantChild(
    val firstName: String,
    val lastName: String,
    val dob: String?,
    val gender: String?,
    val bForm: String?,
    val previousSchool: String?,
    val address: String?,
)

data class MedicalInfo(val allergies: String?, val conditions: String?, val notes: String?) {
    val isEmpty: Boolean get() = allergies.isNullOrBlank() && conditions.isNullOrBlank() && notes.isNullOrBlank()
}

/** A document on the application; [status] is UPLOADED / VERIFIED / REJECTED. */
data class ApplicationDocument(val id: String, val docType: String, val url: String?, val status: String?, val note: String?)
