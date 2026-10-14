package com.schoolapp.core.network.dto.admissions

import kotlinx.serialization.Serializable

@Serializable
data class EnquiryDto(
    val id: String,
    val branchId: String? = null,
    val sessionId: String? = null,
    val classId: String? = null,
    val className: String? = null,
    val childName: String = "",
    val dob: String? = null,
    val guardianName: String = "",
    val phone: String = "",
    val email: String? = null,
    val source: String? = null,
    val notes: String? = null,
    val followUpDate: String? = null,
    val status: String? = null,
    val applicationId: String? = null,
    val createdAt: String? = null,
)

/** `POST /admissions/enquiries`. */
@Serializable
data class CreateEnquiryBodyDto(
    val branchId: String,
    val sessionId: String,
    val classId: String,
    val childName: String,
    val dob: String? = null,
    val guardianName: String,
    val phone: String,
    val email: String? = null,
    val source: String? = null,
    val notes: String? = null,
    val followUpDate: String? = null,
)

/** `PATCH /admissions/enquiries/:id`; null fields are left out (unchanged). */
@Serializable
data class UpdateEnquiryBodyDto(
    val status: String? = null,
    val notes: String? = null,
    val followUpDate: String? = null,
)

/** `POST /admissions/enquiries/:id/convert`: fills what the enquiry did not capture. */
@Serializable
data class ConvertEnquiryBodyDto(val gender: String, val dob: String? = null)
